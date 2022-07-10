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
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Icon from "react-native-vector-icons/Ionicons";
import moment from "moment";
import * as firebase from "firebase";
import AsyncStorage from '@react-native-async-storage/async-storage'

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

const { width: WIDTH } = Dimensions.get("window");
const HEIGHT = Dimensions.get("window").height;

const defaultOptions = {
  significantDigits: 2,
  thousandsSeparator: ".",
  decimalSeparator: ",",
  symbol: "Rp",
};

const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem("@storage_Key:" + key, jsonValue);
  } catch (e) {
    // saving error
    this.notify(e);
    return;
  }
};
const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem("@storage_Key:" + key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    // error reading value
    // this.notify(e);
    return;
  }
};

const currencyFormatter = (value, options) => {
  if (typeof value != "number") {
    value = parseInt(value);
  }
  if (typeof value !== "number") value = 0.0;
  options = { ...defaultOptions, ...options };
  value = value.toFixed(options.significantDigits);

  const [currency, decimal] = value.split(".");
  return `${options.symbol} ${currency.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    options.thousandsSeparator
  )}`;
};

class ProfilScreen extends React.Component {
  constructor() {
    super();

    this.state = {
      press: false,
      visibility: false,
      DateDisplay: "",
      TextInputDisableStatus: true,
      displayFormat: "YYYY-MM-DD",
      user: null,
      kategori: [],
      produklike: {
        key: 0,
        islike: false,
        userid: "",
      },
      firstmedia: "",
      keranjanglist: [],

      keranjang: {
        key: 0,
        dlt: true,
        produkid: "",
        userid: "",
        mediaurl: "",
        produkname: "",
        stok: 0,
        harga: 0
      },
      refresh: true,
      totalproduk: 0,
      totalharga: 0,
      isFetching: true,
    };
  }

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

  onAddStok = async (item) => {
    this.setState({ isFetching: true })
    var tkeranjanglist = this.state.keranjanglist;
    var tuser = this.state.user;
    if (tuser == null)
      tuser = await getData("user");
    var ttotalharga = 0;
    var ttotalproduk = 0;
    var selected = null;
    tkeranjanglist.forEach(function (obj) {

      if (obj.produkid === item.produkid) {
        selected = obj;
        obj.stok = obj.stok + 1;
        if (obj.stok == 0)
          obj.dlt = true;
      }
      ttotalproduk = ttotalproduk + 1;
      ttotalharga = ttotalharga + (obj.stok * obj.harga);
    });
    

    // this.setState({ keranjanglist: tkeranjanglist, totalharga: ttotalharga, totalproduk: ttotalproduk,  });
    firebase
      .database()
      .ref("keranjang/" + tuser.userid + "/" + item.produkid)
      .set(selected);

    await this.loadKeranjang();
  }
  onMinusStok = async (item) => {
    this.setState({ isFetching: true })
    var tkeranjanglist = this.state.keranjanglist;
    var tuser = this.state.user;
    if (tuser == null)
      tuser = await getData("user");
    var ttotalharga = 0;
    var ttotalproduk = 0;
    var selected = null;
    tkeranjanglist.forEach(function (obj) {

      if (obj.produkid === item.produkid) {
        selected = obj;
        obj.stok = obj.stok - 1;
        if (obj.stok == 0)
          obj.dlt = true;
      }
      ttotalproduk = ttotalproduk + 1;
      ttotalharga = ttotalharga + (obj.stok * obj.harga);
    });
    

    //this.setState({ keranjanglist: tkeranjanglist, totalharga: ttotalharga, totalproduk: ttotalproduk, refresh: !this.state.refresh, isFetching: false });
    firebase
      .database()
      .ref("keranjang/" + tuser.userid + "/" + item.produkid)
      .set(selected);

    await this.loadKeranjang();
  }

  onDeleteStok = async (item) => {
    this.setState({ isFetching: true })
    var tkeranjanglist = this.state.keranjanglist;
    var tuser = this.state.user;
    if (tuser == null)
      tuser = await getData("user");
    var ttotalharga = 0;
    var ttotalproduk = 0;
    var selected = null;
    tkeranjanglist.forEach(function (obj) {

      if (obj.produkid === item.produkid) {
        selected = obj;
        obj.stok = 0;
        obj.dlt = true;
      }
      ttotalproduk = ttotalproduk + 1;
      ttotalharga = ttotalharga + (obj.stok * obj.harga);
    });
    

    //this.setState({ totalharga: ttotalharga, totalproduk: ttotalproduk, refresh: !this.state.refresh, isFetching: false });
    firebase
      .database()
      .ref("keranjang/" + tuser.userid + "/" + item.produkid)
      .set(selected);
    await this.loadKeranjang();
  }

  OnChatDetail = async  () => {
    const { navigation } = this.props;
    await this.setState({ isLoading: true });
    var tuser = this.state.user;
    var tproduk = this.state.produk;
    // find tchats

    // create tchats


    var tchats = {
      userid1: tuser.userid,
      username1: tuser.nama,
      userid2: "",
      iswithtoko: true,
      tokoid: tproduk.tokoid,
      tokoname: tproduk.tokoname,
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
    if(tchats.key == null || tchats.key == "")    {
      
      tchats.key = firebase
      .database()
      .ref("chats/")
      .push(tchats).getKey();
    }
    
    tproduk.firstmedia = this.state.firstmedia;
    var tuserchats = {
      key: tchats.key,
      lastmessage: "",
      name: tchats.tokoname,
      tokoid: tproduk.tokoid,
      userid: "",
      produk: tproduk

    };
    await this.setState({ isLoading: false });
    navigation.push("ChatAdminDetail", { params: tuserchats });

  };


  handleConfirm = (date) => {
    this.setState({ DateDisplay: date });
    this.setState({ visibility: false });
    this.setState({ TextInputDisableStatus: true });
  };

  OnProdukDetail = async (selectedproduk) => {
    const { navigation } = this.props;
    var tempproduk = null;
    await firebase
      .database()
      .ref("produk/" + selectedproduk.produkid)
      .on("value", (snapshot) => {

        tempproduk = {
          key: snapshot.key,
          produkcode: snapshot.val().produkcode,
          deskripsi: snapshot.val().deskripsi,
          fitur: snapshot.val().fitur,
          spesifikasi: snapshot.val().spesifikasi,
          stok: snapshot.val().stok,
          produkid: snapshot.val().produkid,
          produkname: snapshot.val().produkname,
          harga: snapshot.val().harga,
          produkmedia: snapshot.val().produkmedia ?? null,
          kategoriid: snapshot.val().kategoriid,
          kategoriname: snapshot.val().kategoriname,
          tokoid: snapshot.val().tokoid,
          tokoname: snapshot.val().tokoname,
          stok: snapshot.val().stok,
          produkdate: snapshot.val().produkdate,
          produkcode: snapshot.val().produkcode,
          dlt: snapshot.val().dlt ?? false,
          produkmediacount: snapshot.val().produkmediacount ?? 0,
          status: snapshot.val().status ?? "",
          likecount: snapshot.val().likecount ?? 0,
        };
      });

    navigation.push("ProdukDetail", { params: tempproduk });
  };

  loadKeranjang = async () => {


    this.setState({ isFetching: true });

    var tuser = this.state.user;
    if (tuser == null) {
      tuser = await getData("user");
    }


    // 
    var tkeranjanglist = [];
    var ttotalproduk = 0;
    var ttotalharga = 0;
    try {
      await firebase
        .database()
        .ref("keranjang/" + tuser.userid + "/")
        .on("value", (snapshot) => {
          //
          snapshot.forEach((child) => {
            if (
              child.key != "count" &&
              child.key != "produkmediacount" &&
              child.val().dlt != true,
              child.val().stok >= 1
            ) {
              ttotalproduk = ttotalproduk + 1;
              ttotalharga = ttotalharga + (child.val().stok * child.val().harga);
              tkeranjanglist.push({
                key: child.key,
                dlt: child.val().dlt,
                produkid: child.val().produkid,
                userid: child.val().userid,
                mediaurl: child.val().mediaurl,
                produkname: child.val().produkname,
                stok: child.val().stok,
                harga: child.val().harga,
              });
            }
          });

          
          this.setState({ keranjanglist: tkeranjanglist, totalproduk: ttotalproduk, totalharga: ttotalharga, isFetching: false, user: tuser });
          storeData("keranjanglist", tkeranjanglist);
          //
        });
    } catch (error) {
      //console.error(error);
    }


  };

  _renderProduk = ({ item }) => {
    // if (item == null || item.stok <= 0 || item.dlt == false)
    // return(
    //   <View></View>
    // )
    
    var uriimage =
      "https://firebasestorage.googleapis.com/v0/b/bishare-48db5.appspot.com/o/adaptive-icon.png?alt=media&token=177dbbe3-a1bd-467e-bbee-2f04ca322b5e";
    var fill = false;
    if (item.mediaurl != null && item.mediaurl != "") {
      uriimage = item.mediaurl
    }


    return (
      <TouchableOpacity onPress={async () => { this.OnProdukDetail(item) }}>
        <View
          style={{
            backgroundColor: "white",
            marginTop: 10,
            borderRadius: 10,
            padding: 10,

            marginHorizontal: 10,
            flexDirection: "row",

          }}
        >

          <View style={{ marginRight: 10, width: 80, backgroundColor: "#F6F6F6", height: 80, overflow: 'hidden', borderRadius: 20 }}>
            <Image
              style={{ width: '100%', height: '100%' }}
              resizeMode={"contain"}
              source={{ uri: uriimage }}
            />
          </View>

          <View style={{ flex: 2, }}>
            <Text style={{ fontWeight: "bold", flexWrap: "wrap", marginBottom: 5 }} numberOfLines={1}>
              {item.produkname}
            </Text>
            <Text style={{ marginBottom: 5 }}> {currencyFormatter(item.harga)} </Text>

            <View style={{ flexDirection: "row" }}>
              <View style={{ borderWidth: 2, borderColor: "#F6F6F6", borderRadius: 10 }}>
                <TouchableOpacity onPress={async () => { this.onMinusStok(item) }}>
                  <Icon name={"remove-outline"} size={25} color={"black"} />
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: 20, paddingHorizontal: 10 }}>{item.stok}</Text>
              <View style={{ borderWidth: 2, borderColor: "#F6F6F6", borderRadius: 10 }}>
                <TouchableOpacity onPress={async () => { this.onAddStok(item) }}>
                  <Icon name={"add-outline"} size={25} color={"black"} />
                </TouchableOpacity>

              </View>

            </View>
          </View>
          <View style={{ flex: 0.5, justifyContent: "center" }}>
            <TouchableOpacity onPress={async () => { this.onDeleteStok(item) }}>
              <Icon name={"trash-outline"} style={{ alignSelf: "flex-end" }} size={25} color={"red"} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  onLogout = async () => {
    const { navigation } = this.props;

    Alert.alert(
      "Log Out",
      "Apakah anda yakin untuk keluar ?",

      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK", onPress: async () => {
            try {

              await storeData("user", null);
              navigation.navigate("RegisterTab");
            } catch (error) {
              console.error(error);
            }

          }
        }
      ]
    );


  };
  async componentDidMount() {
    var tsuer = await getData("user");
    
    this.setState({ user: tsuer });
    //  this.loadKeranjang();
  }

  render() {
    const { navigation } = this.props;
    return (
      <View style={styles.container}>
        <SafeAreaView style={{ height: HEIGHT }}>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingTop: 15,
              paddingBottom: 10,
              backgroundColor: "white"
            }}
          >
            <View style={{ marginTop: 20 }}>
              <TouchableOpacity onPress={() => { const { navigation } = this.props; navigation.goBack(); }}>
                <Icon name={"chevron-back-outline"} size={25} color={"#666872"} />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 20 }}>Profil</Text>
            <View style={{ marginTop: 20 }}>
              <Icon name={"cart"} size={25} color={"white"} />
            </View>
          </View>

          <TouchableOpacity style={{}} onPress={() => { const { navigation } = this.props; navigation.push("EditProfil"); }}>
            <View style={{ flexDirection: "row", marginTop: 20, marginHorizontal: 20, width: WIDTH - 40, justifyContent: "space-between", borderRadius: 10, backgroundColor: "white" }}>
              <View style={{ margin: 10, width: 60, height: 60, overflow: 'hidden', borderRadius: 30 }}>
                <Image
                  style={{ width: '100%', height: '120%' }}
                  source={require("./../assets/Person.jpg")}
                />
              </View>

              <View style={{ flex: 2, justifyContent: "center" }}>
                <Text style={{ fontWeight: "bold", fontSize: 16 }}>{this.state.user == null ? "" : this.state.user.nama ?? ""}</Text>
                <Text style={{ color: "#666872" }}>{this.state.user == null ? "" : this.state.user.email ?? ""}</Text>
              </View>
            </View>
          </TouchableOpacity>
          <ScrollView style={{ marginTop: 10, marginHorizontal: 0, width: WIDTH, paddingBottom: 20, borderRadius: 10, backgroundColor: "white", }}>


            <View style={{ justifyContent: "center", paddingHorizontal: 20, paddingVertical: 10 }}>

              <Text style={{ color: "#666872", fontSize: 16, }}>Menu</Text>
            </View>
            <TouchableOpacity style={{ marginVertical: 10, paddingHorizontal: 20 }} onPress={() => { const { navigation } = this.props; navigation.push("Diskusi"); }}>
              <View style={{ justifyContent: "center" }}>

                <Text style={{ color: "black", fontSize: 16, }}>Diskusi</Text>
              </View>
            </TouchableOpacity >
            <View style={{ borderWidth: 1, borderColor: "#F3F3F3", width: WIDTH }}></View>
            <TouchableOpacity style={{ marginVertical: 10, paddingHorizontal: 20 }} onPress={() => { const { navigation } = this.props; navigation.push("Chat"); }}>
              <View style={{ justifyContent: "center" }}>

                <Text style={{ color: "black", fontSize: 16, }}>Pesan</Text>
              </View>
            </TouchableOpacity >


            <View style={{ borderWidth: 1, borderColor: "#F3F3F3", width: WIDTH }}></View>
            {(this.state.user != null && this.state.user.tokoid != "") &&
              <TouchableOpacity style={{ marginVertical: 10, paddingHorizontal: 20 }} onPress={() => { const { navigation } = this.props; navigation.push("ChatToko"); }}>
                <View style={{ justifyContent: "center" }}>

                  <Text style={{ color: "black", fontSize: 16, }}>Pesan Sebagai Toko</Text>
                </View>
              </TouchableOpacity >

            }
            {(this.state.user != null && this.state.user.tokoid != "") &&

              <View style={{ borderWidth: 1, borderColor: "#F3F3F3", width: WIDTH }}></View>



            }
            {(this.state.user != null && this.state.user.status != "admin") &&
            <TouchableOpacity style={{ marginVertical: 10, paddingHorizontal: 20 }} onPress={async () =>{ this.OnChatDetail()} }>
                <View style={{ justifyContent: "center" }}>

                  <Text style={{ color: "black", fontSize: 16, }}>Chat Admin</Text>
                </View>
              </TouchableOpacity >              
            }

            {(this.state.user != null && this.state.user.status != "admin") &&

            <View style={{ borderWidth: 1, borderColor: "#F3F3F3", width: WIDTH }}></View>



            } 
           
            {(this.state.user != null && this.state.user.status == "admin") &&
              <TouchableOpacity style={{ marginVertical: 10, paddingHorizontal: 20 }} onPress={() => { const { navigation } = this.props; navigation.push(""); }}>
                <View style={{ justifyContent: "center" }}>

                  <Text style={{ color: "black", fontSize: 16, }}>Chat Sebagai Admin</Text>
                </View>
              </TouchableOpacity >

            }
            {(this.state.user != null && this.state.user.status == "admin") &&

            <View style={{ borderWidth: 1, borderColor: "#F3F3F3", width: WIDTH }}></View>



            }
            {(this.state.user != null && this.state.user.status == "admin") &&
              <TouchableOpacity style={{ marginVertical: 10, paddingHorizontal: 20 }} onPress={() => { const { navigation } = this.props; navigation.push("BeliListToko"); }}>
                <View style={{ justifyContent: "center" }}>

                  <Text style={{ color: "black", fontSize: 16, }}>Daftar Beli Sebagai Admin</Text>
                </View>
              </TouchableOpacity >



            }
            {(this.state.user != null && this.state.user.status == "admin") &&

              <View style={{ borderWidth: 1, borderColor: "#F3F3F3", width: WIDTH }}></View>



            }

            <TouchableOpacity style={{ marginVertical: 10, paddingHorizontal: 20 }} onPress={() => { const { navigation } = this.props; navigation.push("EditProfil"); }}>
              <View style={{ justifyContent: "center" }}>

                <Text style={{ color: "black", fontSize: 16, }}>Edit Profil</Text>
              </View>
            </TouchableOpacity >
            <View style={{ borderWidth: 1, borderColor: "#F3F3F3", width: WIDTH }}></View>

            <TouchableOpacity style={{ marginVertical: 10, paddingHorizontal: 20 }} onPress={() => { const { navigation } = this.props; navigation.push("Keranjang"); }}>
              <View style={{ justifyContent: "center" }}>

                <Text style={{ color: "black", fontSize: 16, }}>Keranjang</Text>
              </View>
            </TouchableOpacity >
            <View style={{ borderWidth: 1, borderColor: "#F3F3F3", width: WIDTH }}></View>
            <TouchableOpacity style={{ marginVertical: 10, paddingHorizontal: 20 }} onPress={() => { const { navigation } = this.props; navigation.push("BeliList"); }}>
              <View style={{ justifyContent: "center" }}>

                <Text style={{ color: "black", fontSize: 16, }}>Daftar Beli</Text>
              </View>
            </TouchableOpacity >
            <View style={{ borderWidth: 1, borderColor: "#F3F3F3", width: WIDTH }}></View>
            <TouchableOpacity style={{ marginVertical: 10, paddingHorizontal: 20 }} onPress={() => { const { navigation } = this.props; navigation.push("Event"); }}>
              <View style={{ justifyContent: "center" }}>

                <Text style={{ color: "black", fontSize: 16, }}>Event</Text>
              </View>
            </TouchableOpacity >
            <View style={{ borderWidth: 1, borderColor: "#F3F3F3", width: WIDTH }}></View>

            <TouchableOpacity style={{ marginVertical: 10, paddingHorizontal: 20 }} onPress={() => { const { navigation } = this.props; navigation.push("Kategori"); }}>
              <View style={{ justifyContent: "center" }}>

                <Text style={{ color: "black", fontSize: 16, }}>Kategori</Text>
              </View>
            </TouchableOpacity >
            <View style={{ borderWidth: 1, borderColor: "#F3F3F3", width: WIDTH }}></View>

            {/* <TouchableOpacity style={{ marginVertical: 10, paddingHorizontal: 20 }}>
              <View style={{ justifyContent: "center" }}>

                <Text style={{ color: "black", fontSize: 16, }}>Pusat Bantuan</Text>
              </View>
            </TouchableOpacity >
            <View style={{ borderWidth: 1, borderColor: "#F3F3F3", width: WIDTH }}></View>
            <TouchableOpacity style={{ marginVertical: 10, paddingHorizontal: 20 }}>
              <View style={{ justifyContent: "center" }}>

                <Text style={{ color: "black", fontSize: 16, }}>Pesan </Text>
              </View>
            </TouchableOpacity >
            <View style={{ borderWidth: 1, borderColor: "#F3F3F3", width: WIDTH }}></View>
            <TouchableOpacity style={{ marginVertical: 10, paddingHorizontal: 20 }}>
              <View style={{ justifyContent: "center" }}>

                <Text style={{ color: "black", fontSize: 16, }}>Laporan</Text>
              </View>
            </TouchableOpacity >
            <View style={{ borderWidth: 1, borderColor: "#F3F3F3", width: WIDTH }}></View> */}
            <TouchableOpacity style={{ marginVertical: 10, paddingHorizontal: 20 }} onPress={() => { const { navigation } = this.props; navigation.push("ChangePassword"); }}>
              <View style={{ justifyContent: "center" }}>

                <Text style={{ color: "black", fontSize: 16, }}>Ganti Password</Text>
              </View>
            </TouchableOpacity >
          
          
            <View style={{ borderWidth: 1, borderColor: "#F3F3F3", width: WIDTH }}></View>
            <TouchableOpacity style={{ marginVertical: 10, paddingHorizontal: 20 }} onPress={this.onLogout}>
              <View style={{ justifyContent: "center" }}>

                <Text style={{ color: "red", fontSize: 16, fontWeight: "bold" }}>Log Out</Text>
              </View>
            </TouchableOpacity >
            <View style={{ borderWidth: 1, borderColor: "#F3F3F3", width: WIDTH }}></View>
          </ScrollView>

          <View style={{}}>


          </View>

        </SafeAreaView>
        <View style={{ position: "absolute", bottom: 0, padding: 15, flexDirection: 'row', alignContent: "space-between", width: WIDTH, backgroundColor: "white", borderTopRightRadius: 15, borderTopLeftRadius: 15, paddingBottom: 20 }}>
          <Text style={{ flex: 1, textAlign: "left" }}>V 0.0.1</Text>
          <Text style={{ fontSize: 14, fontWeight: "bold", flex: 1, textAlign: "right", color: "#F24E1E" }}>BiShare</Text>
        </View>
      </View>
    );
  }
}

export default ProfilScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
    height: HEIGHT
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
});
