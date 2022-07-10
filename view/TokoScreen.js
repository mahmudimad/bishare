import { StatusBar } from "expo-status-bar";
import React, { Component } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  Button,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  ImageBackground,
  ScrollView,
  ToastAndroid,
  Clipboard,
  ActivityIndicator,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from '@react-native-async-storage/async-storage'
import moment from "moment";
import * as firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyAG7oZ5gK_4JfibKyOXG4oXqleART-e8vA",
  authDomain: "bishare-48db5.firebaseapp.com",
  databaseURL: "https://bishare-48db5-default-rtdb.firebaseio.com/",
  projectId: "bishare-48db5",
  storageBucket: "bishare-48db5.appspot.com",
  messagingSenderId: "sender-id",
  appId: "1:250899433800:android:982f8764221e4e5666cb7d",
  measurementId: "G-measurement-id",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // if already initialized, use that one
}

Array.prototype.remove = function () {
  var what, a = arguments, L = a.length, ax;
  while (L && this.length) {
    what = a[--L];
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1);
    }
  }
  return this;
};

const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem('@storage_Key:' + key, jsonValue)
  } catch (e) {
    // saving error
    this.notify(e);
    return;
  }
}
const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem('@storage_Key:' + key)
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    // error reading value
    this.notify(e);
    return;
  }
}
const defaultOptions = {
  significantDigits: 2,
  thousandsSeparator: '.',
  decimalSeparator: ',',
  symbol: 'Rp'
}


const currencyFormatter = (value, options) => {
  
  
  if (typeof value != "number") {
    value = parseInt(value);
  }
  if (typeof value !== 'number') value = 0.0
  options = { ...defaultOptions, ...options }
  value = value.toFixed(options.significantDigits)

  const [currency, decimal] = value.split('.')
  return `${options.symbol} ${currency.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    options.thousandsSeparator
  )}${options.decimalSeparator}${decimal}`
}


const { width: WIDTH } = Dimensions.get("window");
const HEIGHT = Dimensions.get("window").height;

class TokoScreen extends React.Component {
  constructor() {
    super();

    this.state = {
      press: false,
      isLoading: true,
      visibility: false,
      DateDisplay: "",
      TextInputDisableStatus: true,
      displayFormat: "YYYY-MM-DD",

      kategori: [],
      produk: [],
      toko: {
        key: "",
        tokocode: "",
        tokoname: "",
        tokoid: "",
        tokodate: "",
        tokodesc: "",
        usernama: "",
      },
      refresh: true,
      isFetching: false,
      viewproduk: [],
      searchHistory: [],
      Search: "",
      showProduk: false,
      user: null
    };
  }
  notify = (message) => {
    if (Platform.OS != "android") {
      // Snackbar.show({
      //     text: message,
      //     duration: Snackbar.LENGTH_SHORT,
      // });
    } else {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    }
  };
  LoadData = async () => {
    const { navigation, route } = this.props;
    const { params: tokoid } = route.params;
    await this.setState({ isLoading: true });
    // get toko
    var ttoko = null;
    var tuser = this.state.user;
    if (tuser == null)
      tuser = await getData("user");

    if (tokoid == null && tokoid != "") {
      this.notify("Toko Kosong");
      navigation.goBack();
      return;
    }
    await firebase
      .database()
      .ref("toko/" + tokoid)
      .on("value", async (snapshot) => {
        if (
          snapshot.key != "count" &&
          snapshot.key != "produkmediacount" &&
          snapshot.val().dlt != true && snapshot.val().tokoid == tokoid
        ) {
          ttoko = snapshot.val();
          ttoko.key = snapshot.key;
        }
        await this.setState({ toko: ttoko, isLoading: false });

      });
    // get produk list

    
    var tempproduk = [];
    await this.setState({ refresh: !this.state.refresh, user: tuser });

    await firebase
      .database()
      .ref("produk/")
      .on("value", async (snapshot) => {
        tempproduk = [];
        snapshot.forEach((child) => {
          if (
            child.key != "count" &&
            child.key != "produkmediacount" &&
            child.val().dlt != true && child.val().tokoid == tokoid
          ) {
            var tempdproduk = child.val();
            tempdproduk.key = child.key;
            tempproduk.push(tempdproduk);
          }
        });
        
        await this.setState({ produk: tempproduk, viewproduk: tempproduk });

      });


  };

  LoadDataSearch = async (tsearch) => {
    this.setState({ isFetching: true });


    
    var tsearch = this.state.Search.toLowerCase();
    var tsearchhistory = this.state.searchHistory ?? [];

    
    
    var tempproduk = [];
    if (tsearch == null || tsearch == "") {
      this.setState({
        viewproduk: tempproduk,
        isFetching: false,
        showProduk: false,
        searchHistory: tsearchhistory
      });
    }
    else {
      tsearchhistory.remove(tsearch);
      tsearchhistory.unshift(tsearch);
      tempproduk = this.state.produk.filter(obj => {
        return obj.produkname.toLowerCase().match(tsearch) || obj.deskripsi.toLowerCase().match(tsearch) || obj.fitur.toLowerCase().match(tsearch) || obj.spesifikasi.toLowerCase().match(tsearch)
      })
      if (tempproduk.length == 0) {
        this.notify("Produk tidak ditemukan");
      }
      
      this.setState({
        viewproduk: tempproduk,
        isFetching: false,
        showProduk: true,
        searchHistory: tsearchhistory
      });
      await storeData("searchHistory", tsearchhistory);

    }
  };
  ClearSearch = async () => {
    this.setState({
      isFetching: false,
      showProduk: false,
      Search: ""
    });
  };
  LoadDataSearch2 = async (tsearch) => {
    this.setState({ isFetching: true });


    
    var tsearchhistory = this.state.searchHistory ?? [];

    
    
    var tempproduk = [];
    if (tsearch == null || tsearch == "") {
      this.setState({
        viewproduk: tempproduk,
        isFetching: false,
        showProduk: false,
        searchHistory: tsearchhistory
      });
    }
    else {
      tsearchhistory.remove(tsearch);
      tsearchhistory.unshift(tsearch);
      tempproduk = this.state.produk.filter(obj => {
        return obj.produkname.toLowerCase().match(tsearch) || obj.deskripsi.toLowerCase().match(tsearch) || obj.fitur.toLowerCase().match(tsearch) || obj.spesifikasi.toLowerCase().match(tsearch)
      })
      if (tempproduk.length == 0) {
        this.notify("Produk tidak ditemukan");
      }
      
      this.setState({
        viewproduk: tempproduk,
        isFetching: false,
        showProduk: true,
        searchHistory: tsearchhistory
      });
      await storeData("searchHistory", tsearchhistory);

    }
  };


  OnRemoveSearch = (tsearch) => {
    var tsearchhistory = this.state.searchHistory ?? [];
    tsearchhistory.remove(tsearch);
    this.setState({
      refresh: !this.state.refresh,
      searchHistory: tsearchhistory
    });
    storeData("searchHistory", tsearchhistory);
  };

  OnSelectSearch = (tsearch) => {
    this.setState({ Search: tsearch });
    this.LoadDataSearch2(tsearch);
  };


  loadProduk = async () => {
    
    

    var tempproduk = [];

    if (this.state.produk == null || this.state.produk.length <= 0) {
      firebase
        .database()
        .ref("produk/")
        .on("value", (snapshot) => {
          snapshot.forEach((child) => {
            if (child.key != "count" && child.val().dlt != true) {
              tempproduk.push({
                key: child.key,
                produkcode: child.val().produkcode,
                deskripsi: child.val().deskripsi,
                produkid: child.val().produkid,
                produkname: child.val().produkname,
                harga: child.val().harga,
              });
            }
          });
        });

      this.setState({ produk: tempproduk });
      if (!this.state.refresh) {
        this.setState({ refresh: true });
      }
    }
  };

  OnProdukDetail = (selectedproduk) => {
    const { navigation } = this.props;
    navigation.push("ProdukDetail", { params: selectedproduk });
  };
  onSubmit = async () => {
    const { navigation } = this.props;
  };

  onPressCancel = () => {
    this.setState({ visibility: false });
    this.setState({ TextInputDisableStatus: true });
  };

  onPressButton = () => {
    this.setState({ visibility: true });
    this.setState({ TextInputDisableStatus: false });
  };

  handleConfirm = (date) => {
    this.setState({ DateDisplay: date });
    this.setState({ visibility: false });
    this.setState({ TextInputDisableStatus: true });
  };
  onLogin = async () => {
    const { navigation } = this.props;
    navigation.push("Login");
  };
  _renderProduk = ({ item }) => {
    
    var uriimage =
      "https://firebasestorage.googleapis.com/v0/b/bishare-48db5.appspot.com/o/adaptive-icon.png?alt=media&token=177dbbe3-a1bd-467e-bbee-2f04ca322b5e";
    var fill = false;
    if (item.produkmedia == null) {
    } else if (typeof item.produkmedia === "object") {
      if (
        Object.keys(item.produkmedia) != null &&
        Object.keys(item.produkmedia).length >= 1
      ) {
        Object.values(item.produkmedia).forEach(function (produkmedia) {
          if (
            produkmedia != null &&
            produkmedia.dlt == false &&
            produkmedia.mediaurl != "" &&
            fill == false
          ) {
            uriimage = produkmedia.mediaurl;
            fill = true;
          }
        });
      }
    }

    return (
      <TouchableOpacity onPress={() => this.OnProdukDetail(item)}>
        <View
          style={{
            width: WIDTH / 2.5,
            backgroundColor: "white",
            marginTop: 10,
            borderRadius: 10,
            alignSelf: "flex-start",
            padding: 10,
            marginHorizontal: 10,


          }}
        >
          <Image
            source={{ uri: uriimage }}
            resizeMode="contain"
            style={{ height: 100, borderRadius: 20, alignItems: "center", }}
          />
          <Text
            style={{ fontWeight: "bold", flexWrap: "wrap" }}
            numberOfLines={1}
          >
            {item.produkname}
          </Text>
          <Text> {currencyFormatter(item.harga)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  _renderHistory = ({ item }) => {
    
    return (
      <View style={{ flexDirection: 'row', }}>


        <TouchableOpacity style={{ flex: 3, paddingVertical: 3, marginLeft: 5 }} onPress={() => this.OnSelectSearch(item)}>
          <View style={{ flexDirection: 'row', }}>
            <Icon name={'ios-timer-outline'} size={25} color={'#666872'} />
            <Text style={{ fontSize: 16 }}> {item} </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={{ paddingVertical: 3, }} onPress={() => this.OnRemoveSearch(item)}>
          <Icon name={'ios-close-outline'} size={25} color={'red'} />
        </TouchableOpacity>



      </View>
    );
  };

  OnChatDetail = async () => {
    const { navigation } = this.props;
    await this.setState({ isLoading: true });
    var tuser = this.state.user;
    var ttoko = this.state.toko;
    // find tchats

    // create tchats


    var tchats = {
      userid1: tuser.userid,
      username1: tuser.nama,
      userid2: "",
      iswithtoko: true,
      tokoid: ttoko.tokoid,
      tokoname: ttoko.tokoname,
      username2: "",

    }

    firebase
      .database()
      .ref("chats/")
      .orderByChild("userid1")
      .equalTo(tuser.userid)
      .on("value", (snapshot) => {

        snapshot.forEach((child) => {
          if (child.val().tokoid == tchats.tokoid && child.val().dlt != true) {
            tchats = child.val();
            tchats.key = child.key;
          }
        });
      });

    await new Promise(r => setTimeout(r, 1000));
    if (tchats.key == null || tchats.key == "") {
      
      tchats.key = firebase
        .database()
        .ref("chats/")
        .push(tchats).getKey();
    }


    var tuserchats = {
      key: tchats.key,
      lastmessage: "",
      name: tchats.tokoname,
      tokoid: ttoko.tokoid,
      userid: "",

    };
    await this.setState({ isLoading: false });
    navigation.push("ChatDetail", { params: tuserchats });

  };

  async componentDidMount() {
    //this.setState({ refresh: true });

    await this.LoadData();

  }

  render() {

    const { navigation } = this.props;
    return (
      <View style={styles.container}>
        <SafeAreaView>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingTop: 10,
              marginBottom: 20
            }}
          >
            <View style={{ marginTop: 20 }}>
              <TouchableOpacity onPress={() => { const { navigation } = this.props; navigation.goBack(); }}>
                <Icon name={"chevron-back-outline"} size={25} color={"#666872"} />
              </TouchableOpacity>

            </View>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 20 }}>Toko</Text>
            <View style={{ marginTop: 20 }}>
              <TouchableOpacity onPress={() => { const { navigation } = this.props; navigation.push("Keranjang"); }}>
                <Icon name={"cart"} size={25} color={"#666872"} />
              </TouchableOpacity>
            </View>
          </View>
          <ActivityIndicator size="large" color="#F24E1E" animating={this.state.isLoading} style={{ position: "absolute", top: HEIGHT / 2, left: (WIDTH / 2) - 20 }} />
          <ScrollView style={{ height: HEIGHT - 40 }}>
            <View style={{ paddingHorizontal: 20, }}>

              <Text style={{ fontSize: 28, color: "black", fontWeight: "bold" }}              >
                {this.state.toko.tokoname}
              </Text>
              <Text
                style={{ fontSize: 14, color: "#F24E1E", fontWeight: "bold" }}
              >
                {this.state.toko.usernama}
              </Text>
            </View>
            <View style={{ paddingHorizontal: 20 }}>

              <View flexDirection="row" style={{ padding: 5 }}>
                <Text style={{ flex: 1, fontSize: 14, color: "#333333" }}>
                  Code
                </Text>
                <TouchableOpacity style={{ flex: 3, }} onPress={this.OnToko}>
                  <Text style={{ fontSize: 16, color: "#F24E1E", fontWeight: 'bold' }}>
                    {this.state.toko.tokocode}
                  </Text>
                </TouchableOpacity>
              </View>
              <View flexDirection="row" style={{ padding: 5 }}>
                <Text style={{ flex: 1, fontSize: 14, color: "#333333" }}>
                  Nama
                </Text>
                <TouchableOpacity style={{ flex: 3, }}>
                  <Text style={{ fontSize: 16, color: "#F24E1E", fontWeight: 'bold' }}>
                    {this.state.toko.tokoname}
                  </Text>
                </TouchableOpacity>
              </View>
              <View flexDirection="row" style={{ padding: 5 }}>
                <Text style={{ flex: 1, fontSize: 14, color: "#333333" }}>
                  Date
                </Text>
                <TouchableOpacity style={{ flex: 3, }}>
                  <Text style={{ fontSize: 16, color: "#F24E1E", fontWeight: 'bold' }}>
                    {this.state.toko.tokodate}
                  </Text>
                </TouchableOpacity>
              </View>
              <View flexDirection="row" style={{ padding: 5 }}>
                <Text style={{ flex: 1, fontSize: 14, color: "#333333" }}>
                  Deskripsi
                </Text>
                <TouchableOpacity style={{ flex: 3, }}>
                  <Text style={{ fontSize: 16, color: "#F24E1E", fontWeight: 'bold' }}>
                    {this.state.toko.tokodesc}
                  </Text>
                </TouchableOpacity>
              </View>
              <View flexDirection="row" style={{ padding: 5 }}>
                <Text style={{ flex: 1, fontSize: 14, color: "#333333", textAlignVertical: 'center' }}>
                  Chat
                </Text>
                <TouchableOpacity style={{ flex: 3, borderColor: "#F24E1E", borderWidth: 1, borderRadius: 10, padding: 5 }} onPress={async () => { this.OnChatDetail() }}>
                  <Text style={{ fontSize: 16, color: "#F24E1E", fontWeight: 'bold' }}>
                    Buka Chat
                  </Text>
                </TouchableOpacity>
              </View>
              <View flexDirection="row" style={{ padding: 5 }}>
                <Text style={{ flex: 1, fontSize: 14, color: "#333333", textAlignVertical: 'center' }} >
                  Kontak
                </Text>
                <TouchableOpacity style={{ flex: 3, }} onPress={()=> {  Clipboard.setString(this.state.toko.kontak); this.notify(this.state.toko.kontak +" copy"); }}>
                  <Text style={{ fontSize: 16, color: "#F24E1E", fontWeight: 'bold' }}>
                    {this.state.toko.kontak}
                  </Text>
                </TouchableOpacity>
              </View>
              {(this.state.toko.alamat === undefined) ? <View></View> :
                    
                   
              <View flexDirection="row" style={{ padding: 5 }}>
                <Text style={{ flex: 1, fontSize: 14, color: "#333333", textAlignVertical: 'center' }} >
                  Alamat
                </Text>
                <TouchableOpacity style={{ flex: 3, }} onPress={()=> {  Clipboard.setString(this.state.toko.alamat); this.notify(this.state.toko.alamat +" copy"); }}>
                  <Text style={{ fontSize: 16, color: "#F24E1E", fontWeight: 'bold' }}>
                  {this.state.toko.alamat}
                  </Text>
                </TouchableOpacity>
              </View>
 }
                    

            </View>



            <FlatList
              data={this.state.viewproduk}
              extraData={this.state.refresh}
              style={{
                padding: 10,

                marginTop: 10,
                backgroundColor: "#F6F6F6",
                borderRadius: 30,

              }}
              scrollEnabled={false}
              numColumns={2}
              contentContainerStyle={{ justifyContent: "space-between" }}
              renderItem={this._renderProduk}
              keyExtractor={(item) => item.produkid.toString()}
              onRefresh={() => this.LoadData()}
              refreshing={this.state.isFetching}
            />

          </ScrollView>

        </SafeAreaView>
      </View>
    );
  }
}

export default TokoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  image: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  logo: {
    flex: 1,
    width: WIDTH / 20,
  },
  logoText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 45,
    marginTop: 5,
    //  fontFamily: 'Roboto-Bold',
    textAlign: "center",
  },
  text: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
  logoContainer: {
    marginTop: HEIGHT / 25,

    justifyContent: "center",
  },
  bottomContainer: {
    marginTop: 100,
    alignItems: "center",
    justifyContent: "center",
  },

  subLogo: {
    color: "#666872",
    fontSize: 15,
  },
  btnLogin: {
    width: WIDTH - 55,
    height: 45,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: "#F24E1E",
    justifyContent: "center",
    marginTop: 20,
  },

  inputContainer: {
    marginTop: 10,
  },
  input: {
    width: WIDTH - 55,
    height: 45,
    borderRadius: 10,
    fontSize: 16,
    paddingLeft: 50,
    color: "#252835",
    backgroundColor: "#fff",
    marginHorizontal: 25,
    borderColor: "#BABABA",
    borderWidth: 1,
  },

  btnEye: {
    position: "absolute",
    top: 8,
    right: 37,
  },
  inputIcon: {
    position: 'absolute',

    top: 8,
    left: 37,
    paddingRight: 5,

  },
  inputIconRight: {
    position: 'absolute',

    top: 8,
    right: 37,
    paddingRight: 5,

  },
});
