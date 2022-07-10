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
import AsyncStorage from "@react-native-async-storage/async-storage";

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
    //   this.notify(e);
    return;
  }
};

const defaultOptions = {
  significantDigits: 2,
  thousandsSeparator: ".",
  decimalSeparator: ",",
  symbol: "Rp",
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

class HomeScreen extends React.Component {
  constructor() {
    super();

    this.state = {
      showPass: true,
      press: false,
      visibility: false,
      DateDisplay: "",
      TextInputDisableStatus: true,
      displayFormat: "YYYY-MM-DD",
      nama: "",
      alamatLengkap: "",
      email: "",
      password: "",
      konfirmasiPassword: "",
      nomorHP: "",
      kategori: [],
      event: [],
      produk: [],
      viewproduk: [],
      toko: null,
      refresh: true,
      refreshkategori: true,
      refreshevent: true,
      eventshow: false,
      user: [],
      rekomendasi: [],
      rekomendasikey: [],
      searchtext: "",
      connected: false,
      loadddate: null,
      isFetching: true,
      selectedkategori: "Rekomendasi",
    };
  }

  showPass = async () => {
    if (this.state.press == false) {
      this.setState({ showPass: false, press: true });
    } else {
      this.setState({ showPass: true, press: false });
    }
  };
  LoadData = async () => {
    await this.setState({ isFetching: true });

    var tuser = await getData("user");
    if (tuser == null || tuser.userid == "") {
      const { navigation } = this.props;
      navigation.push("RegisterTab");
      return;
    }

    var tloadddate = await getData("loadddate");
    await this.setState({
      user: tuser,
      nama: tuser.nama,
      loadddate: tloadddate,
    });
    // await this.CekKoneksi();
    // 

    
    await this.loadToko();
    await this.loadEvent();
    await this.loadKategori();
    await this.loadRekomendasi();
    var tp = await this.loadProduk();

    if (this.state.produk == null || this.state.produk.length == 0)
      await new Promise((r) => setTimeout(r, 1000));
    if (this.state.produk == null || this.state.produk.length == 0)
      await new Promise((r) => setTimeout(r, 1000));
    if (this.state.produk == null || this.state.produk.length == 0)
      await new Promise((r) => setTimeout(r, 1000));
    if (this.state.produk == null || this.state.produk.length == 0)
      await new Promise((r) => setTimeout(r, 1000));
    await this.loadProdukKategori(this.state.selectedkategori ?? "Rekomendasi");

    if (this.state.produk == null) {
      var tkategori = await getData("kategori");
      var trekomendasi = await getData("rekomendasi");
      var trekomendasikey = await getData("rekomendasikey");
      var tproduk = await getData("produk");
      await this.setState({
        kategori: tkategori,
        rekomendasi: trekomendasi,
        rekomendasikey: trekomendasikey,
        produk: tproduk,
      });
      await this.loadProdukKategori(
        this.state.selectedkategori ?? "Rekomendasi"
      );
    }

    await this.setState({ isFetching: false, refresh: !this.state.refresh });
  };

  onRefresh() {
    this.LoadData();
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

  CekKoneksi = async () => {
    firebase
      .database()
      .ref("info/connected")
      .on("value", (snapshot) => {
        if (snapshot.val() == true) {
          this.setState({ connected: true });
        } else {
          this.setState({ connected: false });
        }
      });
  };

  loadToko = async () => {
    var tuser = this.state.user;
    var found = false;
    if (tuser == null) tuser = await getData("user");

    await firebase
      .database()
      .ref("users")
      .orderByChild("username")
      .equalTo(tuser.username)
      .on("value", (snapshot) => {
        snapshot.forEach((child) => {
          if (child.key != "count" && child.val().dlt != true) {
            if (child.val().password == tuser.password) {
              tuser = child.val();
              if (tuser.tokoid === undefined) {
                tuser.tokoid = "";
              }
              storeData("user", tuser);
              this.setState({ user: tuser });
              found = true;
            }
          }
        });
      });
    await new Promise((r) => setTimeout(r, 3000));
    if (!found) {
      this.notify("User tidak ditemukan");
      const { navigation } = this.props;
      // navigation.navigate("RegisterTab");
    }

    var ttoko = this.state.toko;

    if (
      (ttoko == null || ttoko.tokoid != "") &&
      tuser.tokoid !== undefined &&
      tuser.tokoid != ""
    ) {
      

      await firebase
        .database()
        .ref("toko/" + tuser.tokoid)
        .on("value", (snapshot2) => {
          ttoko = snapshot2.val();
          ttoko.key = snapshot2.key;

          ttoko = {
            key: snapshot2.key,
            dlt: snapshot2.val().dlt ?? false,
            foto: snapshot2.val().foto,
            kontak: snapshot2.val().kontak,
            status: snapshot2.val().status,
            tokocode: snapshot2.val().tokocode,
            tokodate: snapshot2.val().tokodate,
            tokoid: snapshot2.val().tokoid,
            tokoname: snapshot2.val().tokoname,
            userid: snapshot2.val().userid,
            usernama: snapshot2.val().usernama,
          };
          this.setState({ toko: ttoko });
          storeData("toko", ttoko);
        });
    }
  };

  loadKategori = async () => {
    if (this.state.kategori == null || this.state.kategori.length <= 3) {
      var tempkategori = [];
      

      firebase
        .database()
        .ref("kategori/")
        .on("value", (snapshot) => {
          tempkategori.push({
            key: "Rekomendasi",
            kategoricode: "Rekomendasi",
            kategoridesc: "Rekomendasi",
            kategoriid: "Rekomendasi",
            kategoriname: "Rekomendasi",
          });
          tempkategori.push({
            key: "All",
            kategoricode: "All",
            kategoridesc: "All",
            kategoriid: "All",
            kategoriname: "All",
          });

          snapshot.forEach((child) => {
            if (child.key != "count" && child.val().dlt != true) {
              tempkategori.push({
                key: child.key,
                kategoricode: child.val().kategoricode,
                kategoridesc: child.val().kategoridesc,
                kategoriid: child.val().kategoriid,
                kategoriname: child.val().kategoriname,
              });
            }
          });
        });
      this.setState({ kategori: tempkategori });
      await storeData("kategori", tempkategori);

      this.setState({ refreshkategori: !this.state.refreshkategori });
    }
  };
  loadEvent = async () => {
    var temptevent = [];
    
    var teventshow = false;
    firebase
      .database()
      .ref("event/")
      .on("value", (snapshot) => {
        temptevent = [];

        snapshot.forEach((child) => {
          if (
            child.key != "count" &&
            child.val().dlt != true &&
            child.val().status == "aktif"
          ) {
            var t = child.val();
            teventshow = true;
            t.key = child.key;
            temptevent.push(t);
          }
        });
        
        this.setState({ event: temptevent, eventshow: teventshow });
        storeData("event", temptevent);

        this.setState({ refreshevent: !this.state.refreshevent });
      });
  };
  loadRekomendasi = async () => {
    if (this.state.rekomendasi == null || this.state.rekomendasi.length == 0) {
      
      var temprekomendasi = [];
      var temprekomendasikey = [];
      await firebase
        .database()
        .ref("rekomendasi/")
        .on("value", async (snapshot) => {
          snapshot.forEach((child) => {
            if (child.key != "count" && child.val().dlt != true) {
              temprekomendasikey.push(child.val().produkid);
              temprekomendasi.push({
                key: child.key,
                produkid: child.val().produkid,
                produkname: child.val().produkname,
                rekomendasiid: child.val().rekomendasiid,
              });
            }
          });

          await this.setState({
            rekomendasi: temprekomendasi,
            rekomendasikey: temprekomendasikey,
          });
          await storeData("rekomendasi", this.state.rekomendasi);
          await storeData("rekomendasikey", this.state.rekomendasikey);
        });
    }
  };

  loadProdukKategori = async (kategori) => {
    var tproduk = this.state.produk;
    if (tproduk.length <= 0) {
      
      return;
    }

    var tviewproduk = [];

    await this.setState({ isFetching: true });

    if (kategori == "All") {
      tviewproduk = tproduk;
    } else if (kategori == "Rekomendasi") {
      tviewproduk = tproduk.filter((item) =>
        this.state.rekomendasikey.includes(item.produkid.toString())
      );
    } else {
      tviewproduk = tproduk.filter((obj) => {
        return obj.kategoriid == kategori;
      });
    }

    await this.setState({
      viewproduk: tviewproduk,
      selectedkategori: kategori,
      refresh: !this.state.refresh,
      isFetching: false,
    });
  };
  OnKategoriDetail = (selectedproduk) => {
    if (selectedproduk.key != "Rekomendasi" && selectedproduk.key != "All") {
      const { navigation } = this.props;
      navigation.push("KategoriDetail", { params: selectedproduk });
    }
  };
  loadProduk = async () => {
    
    var tempproduk = [];
    await this.setState({ refresh: !this.state.refresh });

    await firebase
      .database()
      .ref("produk/")
      .on("value", async (snapshot) => {
        tempproduk = [];
        snapshot.forEach((child) => {
          if (
            child.key != "count" &&
            child.key != "produkmediacount" &&
            child.val().dlt != true
          ) {
            tempproduk.push({
              key: child.key,
              produkcode: child.val().produkcode,
              deskripsi: child.val().deskripsi,
              fitur: child.val().fitur,
              spesifikasi: child.val().spesifikasi,
              stok: child.val().stok,
              produkid: child.val().produkid,
              produkname: child.val().produkname,
              harga: child.val().harga,
              produkmedia: child.val().produkmedia ?? null,
              kategoriid: child.val().kategoriid,
              kategoriname: child.val().kategoriname,
              tokoid: child.val().tokoid,
              tokoname: child.val().tokoname,
              stok: child.val().stok,
              produkdate: child.val().produkdate,
              produkcode: child.val().produkcode,
              dlt: child.val().dlt ?? false,
              produkmediacount: child.val().produkmediacount ?? 0,
              status: child.val().status ?? "",
              likecount: child.val().likecount ?? 0,
              youtubevideo: child.val().youtubevideo ?? "",

              reviewtotal: child.val().reviewtotal ?? 0,
              reviewcount: child.val().reviewcount ?? 0,
              reviewavg: child.val().reviewavg ?? 0,
              review: child.val().review ?? [],
            });
          }
        });

        await this.setState({ produk: tempproduk });
        await storeData("produk", tempproduk);
        return tempproduk;
      });
  };
  onSubmit = async () => {
    const { navigation } = this.props;
  };
  showDatePicker = () => {
    this.setState({ visibility: true });
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
  onSearch = () => {
    const { navigation } = this.props;
    navigation.push("Search");
  };

  onLogin = async () => {
    const { navigation } = this.props;
    navigation.push("Login");
  };
  onProfil = async () => {
    const { navigation } = this.props;
    navigation.push("Profil");
  };

  OnProdukDetail = (selectedproduk) => {
    const { navigation } = this.props;
    navigation.push("ProdukDetail", { params: selectedproduk });
  };
  OnEventDetail = (selectedproduk) => {
    const { navigation } = this.props;
    navigation.push("EventDetail", { params: selectedproduk });
  };

  onLogout = async () => {
    const { navigation } = this.props;

    try {
      await storeData("user", null);
      navigation.push("RegisterTab");
    } catch (error) {
      console.error(error);
    }
  };
  _renderItem = ({ item }) => {
    var backcolor = "white";
    var fontcolor = "black";
    if (item.kategoriid == this.state.selectedkategori) {
      backcolor = "#F24E1E";
      fontcolor = "white";
    }
    return (
      <TouchableOpacity
        onPress={async (xitem) => {
          
          

          this.loadProdukKategori(item.kategoriid);
          this.setState({
            selectedkategori: item.kategoriid,
            refresh: !this.state.refresh,
            refreshkategori: !this.state.refreshkategori,
          });
        }}
        onLongPress={() => this.OnKategoriDetail(item)}
      >
        <View
          style={{
            paddingHorizontal: 15,
            paddingVertical: 9,
            borderRadius: 20,
            backgroundColor: backcolor,
            marginHorizontal: 7,
          }}
        >
          <Text style={{ color: fontcolor }}>{item.kategoriname}</Text>
        </View>
      </TouchableOpacity>
    );
  };
  _renderEvent = ({ item }) => {
    return (
      <TouchableOpacity
        style={{
          borderWidth: 1,
          borderRadius: 10,
          borderColor: "#F24E1E",
          borderBottomWidth: 0,

          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.8,
          shadowRadius: 2,
          elevation: 1,
          backgroundColor: "white",
          width: WIDTH - 50,
          padding: 10,
          marginHorizontal: 10,
          marginVertical: 5,
          height: 105,
        }}
        onPress={() => this.OnEventDetail(item)}
      >
        <View
          style={{
            backgroundColor: "white",
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 19,
              color: "#F24E1E",
              paddingBottom: 5,
            }}
            numberOfLines={1}
          >
            {item.eventnama}
          </Text>
          <Text style={{ fontSize: 15 }} numberOfLines={3} lineBreakMode="clip">
            {" "}
            {item.eventdesc}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  renderEmptyContainer = () => {
    return (
      <View
        style={{
          width: WIDTH - 30,
          backgroundColor: "white",
          marginTop: 10,
          borderRadius: 10,
          alignSelf: "center",
          padding: 10,
          marginHorizontal: 10,
          alignItems: "center",
          alignContent: "center",
        }}
      >
        <Image
          source={require("./../assets/logo.png")}
          style={{ height: 100, width: 100 }}
          resizeMode="contain"
        />

        <Text
          style={{ fontSize: 17, flexWrap: "wrap", textAlign: "center" }}
          numberOfLines={1}
        >
          Produk kosong
        </Text>
      </View>
    );
  };
  renderHeader = () => {
    return (
      <View
        style={{
          backgroundColor: "#F6F6F6",

          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderBottomLeftRadius: 20,
          borderBotoomRightRadius: 20,
          paddingVertical: 4,
          alignContent: "space-between",
        }}
      >
        <FlatList
          data={this.state.kategori}
          extraData={this.state.refreshkategori}
          style={{ height: 50, flexGrow: 0, alignContent: "center" }}
          horizontal={true}
          renderItem={this._renderItem}
          keyExtractor={(item) => item.kategoriid.toString()}
        />
      </View>
    );
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
            marginVertical: 5,
            borderRadius: 10,
            alignSelf: "flex-start",
            padding: 10,
            marginHorizontal: 10,
          }}
        >
          <Image
            source={{ uri: uriimage }}
            resizeMode="contain"
            style={{ height: 100, borderRadius: 20, alignItems: "center" }}
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

  async componentDidMount() {
    //this.setState({ refresh: true });
    await this.setState({ selectedkategori: "Rekomendasi" });
    await this.LoadData();
    await this.loadProdukKategori(this.state.selectedkategori ?? "Rekomendasi");
  }
  componentWillUnmount() {}
  render() {
    const { navigation } = this.props;
    return (
      <View style={styles.container}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingTop: 20,
          }}
        >
          <View style={{}}>
            <Image
              source={require("./../assets/logo.png")}
              style={{ height: 50, alignContent: "flex-start", width: 50 }}
              resizeMode="contain"
            />
          </View>

          <View style={{}}>
            <TouchableOpacity
              onPress={this.onProfil}
              style={{ paddingHorizontal: 10, paddingTop: 20 }}
            >
              <Icon name={"ios-person"} size={25} color={"#666872"} />
            </TouchableOpacity>
          </View>
        </View>
        {this.state.eventshow && (
          <View style={{ paddingTop: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "space-around" }}>
              <Text style={{ paddingHorizontal: 25, fontSize: 16, flex: 2 }}>
                Event Aktif
              </Text>
              <TouchableOpacity
                style={{ alignItems: "flex-end", paddingRight: 10 }}
                onPress={() => {
                  this.setState({ eventshow: false });
                }}
              >
                <Icon name={"ios-close-outline"} size={25} color={"red"} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={this.state.event}
              extraData={this.state.refreshevent}
              style={{ height: 120, flexGrow: 0, alignContent: "center" }}
              horizontal={true}
              renderItem={this._renderEvent}
              keyExtractor={(item) => item.eventid.toString()}
            />
          </View>
        )}
        <View style={{ paddingHorizontal: 25, paddingTop: 10 }}>
          <Text style={{ fontSize: 16 }}>Hi, {this.state.nama ?? ""}</Text>
        </View>

        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={this.onSearch}>
            <TextInput
              style={styles.input}
              onChangeText={(val) => this.setState({ searchtext: val })}
              placeholder={"Search "}
              placeholderTextColor={"#666872"}
              underlineColorAndroid="transparent"
              editable={false}
            />
            <Icon
              name={"search"}
              size={25}
              color={"#666872"}
              style={styles.inputIcon}
            />
          </TouchableOpacity>
        </View>

        <FlatList
          data={this.state.viewproduk}
          extraData={this.state.refresh}
          style={{
            paddingHorizontal: 10,
            marginTop: 0,
            backgroundColor: "#F6F6F6",
            paddingBottom: 0,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
          scrollEnabled={true}
          numColumns={2}
          contentContainerStyle={{ justifyContent: "space-between" }}
          renderItem={this._renderProduk}
          ListEmptyComponent={this.renderEmptyContainer}
          ListHeaderComponent={this.renderHeader}
          stickyHeaderIndices={[0]}
          keyExtractor={(item) => item.produkid}
          onRefresh={() => this.onRefresh()}
          refreshing={this.state.isFetching}
        />
      </View>
    );
  }
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    height: HEIGHT,
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
  inputIcon: {
    position: "absolute",
    borderColor: "#666872",
    top: 8,
    left: 37,
    paddingRight: 5,
  },
  btnEye: {
    position: "absolute",
    top: 8,
    right: 37,
  },
});
