import { StatusBar } from "expo-status-bar";
import React, { Component} from "react";
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
  ActivityIndicator,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Icon from "react-native-vector-icons/Ionicons";
import moment from "moment";
import * as firebase from "firebase";
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Picker as Select } from "@react-native-community/picker";

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
var group = "";
const BiayaAdmin = 1000;

class BeliKonfirmasiTokoScreen extends React.Component {
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
      beli: [],
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
        harga: 0,
      },
      totalproduk:0,
      refresh: true,
      totalproduk: 0,
      totalharga: 0,
      isFetching: true,
      optionkirim: [
        { label: "Ambil Sendiri", biaya: 0 },
        { label: "Kirim", biaya: 10000 },
      ],
      optionbayarambil: [
        { label: "Bayar Tunai", biaya: 5000 },
        { label: "Transfer Bank", biaya: 5000 },
      ],
      optionbayarkirim: [{ label: "Transfer Bank", biaya: 5000 }],
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

  
  calculateTotalProduk=async () => {
    try {
      this.setState({ isFetching: true });
      var tproduklist = this.state.beli.produklist;
      var ttotalproduk = 0;
      tproduklist.forEach(function (obj) {
        
        if (obj.dlt == false)
          ttotalproduk = obj.stok;
      });

      this.setState({
        totalproduk: ttotalproduk,
        isFetching: false,
      });
    } catch (error) { console.error(error) }

  }

  onAddStok = async (item) => {
    try {
      this.setState({ isFetching: true });
      var tproduklist = this.state.beli.produklist;
      var tbeli = this.state.beli;
      var tuser = this.state.user;
      if (tuser == null) tuser = await getData("user");
      var ttotalharga = 0;
      var tbiayaproduk = 0;
      var selected = null;
      tproduklist.forEach(function (obj) {
        if (obj.produkid === item.produkid) {
          selected = obj;
          obj.stok = obj.stok + 1;
          if (obj.stok == 0) obj.dlt = true;
        }
        if (obj.dlt == false)
          tbiayaproduk = tbiayaproduk + obj.stok * obj.harga;
      });

      tbeli.produklist = tproduklist;
      tbeli.totalharga = tbiayaproduk + tbeli.hargaadmin + tbeli.hargaongkir;
      tbeli.hargaproduk = tbiayaproduk;

      this.setState({
        beli: tbeli,
        isFetching: false,
      });
    } catch (error) {
      console.error(error);
    }
    await this.calculateTotalProduk();
    // firebase
    //   .database()
    //   .ref("keranjang/" + tuser.userid + "/" + item.produkid)
    //   .set(selected);
  };
  onMinusStok = async (item) => {
    try {
      this.setState({ isFetching: true });
      var tproduklist = this.state.beli.produklist;
      var tbeli = this.state.beli;
      var tuser = this.state.user;
      if (tuser == null) tuser = await getData("user");
      var ttotalharga = 0;
      var tbiayaproduk = 0;
      var selected = null;
      tproduklist.forEach(function (obj) {
        if (obj.produkid === item.produkid) {
          selected = obj;
          obj.stok = obj.stok - 1;
          if (obj.stok == 0) obj.dlt = true;
        }
        if (obj.dlt == false)
          tbiayaproduk = tbiayaproduk + obj.stok * obj.harga;
      });

      tbeli.produklist = tproduklist;
      tbeli.totalharga = tbiayaproduk + tbeli.hargaadmin + tbeli.hargaongkir;
      tbeli.hargaproduk = tbiayaproduk;

      this.setState({
        beli: tbeli,
        isFetching: false,
      });
    } catch (error) {
      console.error(error);
    }
    await this.calculateTotalProduk();
  };

  onDeleteStok = async (item) => {
    try {
      this.setState({ isFetching: true });
      var tproduklist = this.state.beli.produklist;
      var tbeli = this.state.beli;
      var tuser = this.state.user;
      if (tuser == null) tuser = await getData("user");
      var ttotalharga = 0;
      var tbiayaproduk = 0;
      var selected = null;
      tproduklist.forEach(function (obj) {
        if (obj.produkid === item.produkid) {
          selected = obj;
          obj.stok = 0;
          if (obj.stok == 0) obj.dlt = true;
        }
        if (obj.dlt == false)
          tbiayaproduk = tbiayaproduk + obj.stok * obj.harga;
      });

      tbeli.produklist = tproduklist;
      tbeli.totalharga = tbiayaproduk + tbeli.hargaadmin + tbeli.hargaongkir;
      tbeli.hargaproduk = tbiayaproduk;

      this.setState({
        beli: tbeli,
        isFetching: false,
      });
    } catch (error) {
      console.error(error);
    }
    await this.calculateTotalProduk();
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
        tempproduk = snapshot.val();
        tempproduk.key = snapshot.key;
      });

    navigation.push("ProdukDetail", { params: tempproduk });
  };

  LoadBeli = async () => {
    const { navigation, route } = this.props;
    const { params: tbeli } = route.params;
    this.setState({ isFetching: true, beli: tbeli });

    // get data
    var tuser = this.state.user;
    // check
    if (tbeli == null) {
      this.notify("data kosong");
      const { navigation } = this.props;
      navigation.goBack();
    }
    if (tbeli.produklist.length <= 0) {
      this.notify("data produk kosong");
      const { navigation } = this.props;
      navigation.goBack();
    }
    await this.calculateTotalProduk();
    // update dtabase
    this.setState({ isFetching: false, beli: tbeli });
  };

  onBatal = async () => {
    const { navigation } = this.props;

    Alert.alert(
      "Konfirmasi",
      "Apakah anda yakin untuk membatalkan ?",

      [
        {
          text: "Tidak",
          style: "tidak",
        },
        {
          text: "Ya",
          onPress: async () => {
            try {
              var tbeli = this.state.beli;
              var tuser = this.state.user;
              tbeli.log +=
                tuser.nama + ": Penjual Batal " + this.GetDateTime() + "\n";
              tbeli.status = "Penjual Batal";
              tbeli.belidate = Date.now();

              await firebase
                .database()
                .ref("beli/" + tbeli.key)
                .set(tbeli);

              navigation.goBack();
            } catch (error) {
              console.error(error);
            }
          },
        },
      ]
    );
  };

  onKonfirmasi = async () => {
    const { navigation } = this.props;

    Alert.alert(
      "Konfirmasi",
      "Apakah anda yakin untuk membeli ?",

      [
        {
          text: "Tidak",
          style: "tidak",
        },
        {
          text: "Ya",
          onPress: async () => {
            try {
              var tbeli = this.state.beli;
              var tuser = this.state.user;
              tbeli.log +=
                "\n " + tuser.nama + ": pembeli konfirmasi " + Date.now();
              tbeli.status = "Menunggu Konfirmasi Penjual";
              tbeli.belidate = Date.now();

              await firebase
                .database()
                .ref("beli/" + tbeli.key)
                .set(tbeli);

              navigation.goBack();
            } catch (error) {
              console.error(error);
            }
          },
        },
      ]
    );
  };

  onKonfirmasiPenjual = async () => {
    const { navigation } = this.props;

    Alert.alert(
      "Konfirmasi",
      "Apakah anda yakin produk ini tersedia ?",

      [
        {
          text: "Tidak",
          style: "tidak",
        },
        {
          text: "Ya",
          onPress: async () => {
            try {
              var tbeli = this.state.beli;
              var tuser = this.state.user;
              var vstatus = "Sistem Error";

              if (
                tbeli.metodepembayaran == "Bayar Tunai" &&
                tbeli.metodepengiriman == "Ambil Sendiri"
              ) {
                vstatus = "Menunggu Pengambilan";
              } else if (tbeli.metodepembayaran == "Transfer Bank") {
                vstatus = "Menunggu Pembayaran";
              } else {
                
                
                return;
              }
              tbeli.log +=
                tuser.nama +
                ": penjual konfirmasi " +
                this.GetDateTime() +
                "\n";
              tbeli.status = vstatus;
              tbeli.belidate = Date.now();

              await firebase
                .database()
                .ref("beli/" + tbeli.key)
                .set(tbeli);

              navigation.goBack();
            } catch (error) {
              console.error(JSON.stringify(error));
            }
          },
        },
      ]
    );
  };
  onKonfirmasiPembayaran = async () => {
    const { navigation } = this.props;

    Alert.alert(
      "Konfirmasi",
      "Apakah anda yakin pembeli telah melakukan pembayaran ?",

      [
        {
          text: "Tidak",
          style: "tidak",
        },
        {
          text: "Ya",
          onPress: async () => {
            try {
              var tbeli = this.state.beli;
              var tuser = this.state.user;
              var status = "Sistem Error";

              tbeli.log +=
                tuser.nama +
                ": penjual konfirmasi pembayaran " +
                this.GetDateTime() +
                "\n";
              tbeli.status = "Menunggu Pengambilan";
              tbeli.belidate = Date.now();

              await firebase
                .database()
                .ref("beli/" + tbeli.key)
                .set(tbeli);

              if (tbeli.metodepengiriman == "Ambil Sendiri") {
                Alert.alert(
                  "Pengingat",
                  "Silahkan tunggu pembeli mengambil barang",
                  [{ text: "OK", onPress: async () => {} }]
                );
              } else if (tbeli.metodepengiriman == "Kirim") {
                Alert.alert(
                  "Pengingat",
                  "Silahkan mengirim barang ke alamat yang diminta pembeli",
                  [{ text: "OK", onPress: async () => {} }]
                );
              }
              navigation.goBack();
            } catch (error) {
              console.error(error);
            }
          },
        },
      ]
    );
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
      uriimage = item.mediaurl;
    }
    if (item.dlt == true) {
      return;
    }

    return (
      <TouchableOpacity
        onPress={async () => {
          this.OnProdukDetail(item);
        }}
      >
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
          <View
            style={{
              marginRight: 10,
              width: 80,
              backgroundColor: "#F6F6F6",
              height: 80,
              overflow: "hidden",
              borderRadius: 10,
            }}
          >
            <Image
              style={{ width: "100%", height: "100%" }}
              resizeMode={"contain"}
              source={{ uri: uriimage }}
            />
          </View>

          <View style={{ flex: 2 }}>
            <Text
              style={{ fontWeight: "bold", flexWrap: "wrap", marginBottom: 5 }}
              numberOfLines={1}
            >
              {item.produkname}
            </Text>
            <Text style={{ marginBottom: 5 }}>
              {" "}
              {item.stok} Item x {currencyFormatter(item.harga)}
            </Text>

            <View style={{ flexDirection: "row" }}>
              <Text
                style={{
                  fontWeight: "bold",
                  flexWrap: "wrap",
                  marginBottom: 5,
                }}
                numberOfLines={1}
              >
                {item.tokoname}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  GetDateTime = () => {
    var today = new Date();
    var date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    var time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return date + " " + time;
  };
  getStatusColor = () => {
    var status = this.state.beli.status;
    if (status == "Draft") return "#FFC947";
    if (status == "User Batal") return "#CD113B";
    if (status == "Penjual Batal") return "#DA0037";
    if (status == "Penjual Batal") return "#DA0037";
    if (status == "Menunggu Konfirmasi Penjual") return "#39A2DB";
    if (status == "Menunggu Pembayaran") return "#185ADB";
    if (status == "Menunggu Konfirmasi Pembayaran") return "#5C33F6";
    if (status == "Menunggu Pengambilan") return "#185ADB";
    if (status == "Selesai") return "#01937C";
    else return "black";
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

        <Text style={{ fontSize: 17, flexWrap: "wrap", textAlign: "center" }}>
          Produk kosong
        </Text>
      </View>
    );
  };
  async componentDidMount() {
    var tsuer = await getData("user");
    this.setState({ user: tsuer });
    await this.LoadBeli();
  }

  render() {
    const { navigation } = this.props;
    return (
      <View style={styles.container}>
        <ScrollView style={{ height: HEIGHT }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingTop: 15,
              paddingBottom: 10,
              backgroundColor: "white",
            }}
          >
            <View style={{ marginTop: 20 }}>
              <TouchableOpacity
                onPress={() => {
                  const { navigation } = this.props;
                  navigation.goBack();
                }}
              >
                <Icon
                  name={"chevron-back-outline"}
                  size={25}
                  color={"#666872"}
                />
              </TouchableOpacity>
            </View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                marginTop: 20,
                color: this.getStatusColor(),
              }}
              lineBreakMode={"tail"}
            >
              {this.state.beli.status ?? "Beli"} - {this.state.beli.username}
            </Text>
            <View style={{ marginTop: 20 }}>
              <Icon name={"cart"} size={25} color={"white"} />
            </View>
          </View>

          <ActivityIndicator
            size="large"
            color="#F24E1E"
            animating={this.state.isFetching}
            style={{
              position: "absolute",
              top: HEIGHT / 2,
              left: WIDTH / 2 - 20,
            }}
          />
          <View
            style={{
              backgroundColor: "white",
              marginTop: 10,
              borderRadius: 10,
              padding: 10,

              marginHorizontal: 15,
              flexDirection: "row",
            }}
          >
            <View style={{ flex: 2 }}>
              <TouchableOpacity
                onPress={() => {
                  const { navigation } = this.props;
                  navigation.push("Toko", { params: this.state.beli.tokoid });
                }}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    flexWrap: "wrap",
                    marginBottom: 5,
                  }}
                  numberOfLines={1}
                >
                  {this.state.beli.tokoname}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{}}>
            <FlatList
              data={this.state.beli.produklist}
              extraData={this.state.refresh}
              style={{
                paddingHorizontal: 10,
                backgroundColor: "#F6F6F6",
              }}
              ListEmptyComponent={this.renderEmptyContainer()}
              contentContainerStyle={{ justifyContent: "space-between" }}
              renderItem={this._renderProduk}
              keyExtractor={(item) => item.produkid.toString()}
              onRefresh={() => this.LoadBeli()}
              refreshing={this.state.isFetching}
              scrollEnabled={false}
            />
          </View>

          <View
            style={{
              backgroundColor: "white",
              marginTop: 10,
              borderRadius: 10,
              padding: 10,
              marginHorizontal: 15,
            }}
          >
            <Text style={{ fontSize: 14 }}>Catatan</Text>
            <TextInput
              style={{ fontSize: 12 }}
              placeholder={"Masukkan Catatan"}
              onChangeText={async (val) => {
                var tbeli = this.state.beli;
                tbeli.catatan = val;
                await this.setState({ beli: tbeli });
              }}
              defaultValue={this.state.beli.catatan}
              placeholderTextColor={"#666872"}
              underlineColorAndroid="transparent"
              keyboardType={"default"}
              textAlignVertical={"top"}
              editable={false}
            />
          </View>
          <View
            style={{
              backgroundColor: "white",
              marginTop: 10,
              borderRadius: 10,
              padding: 10,
              marginHorizontal: 15,
            }}
          >
            <Text style={{ fontSize: 14 }}>Nama Lengkap</Text>
            <TextInput
              style={{ fontSize: 12 }}
              placeholder={"Masukkan Nama Lengkap"}
              onChangeText={async (val) => {
                var tbeli = this.state.beli;
                tbeli.namalengkap = val;
                await this.setState({ beli: tbeli });
              }}
              defaultValue={this.state.beli.namalengkap}
              placeholderTextColor={"#666872"}
              underlineColorAndroid="transparent"
              keyboardType={"default"}
              textAlignVertical={"top"}
              editable={false}
            />
            <Text style={{ fontSize: 14 }}>Alamat (Optional)</Text>
            <TextInput
              style={{ fontSize: 12, height: 40 }}
              placeholder={"Masukkan Alamat"}
              onChangeText={async (val) => {
                var tbeli = this.state.beli;
                tbeli.alamat = val;
                await this.setState({ beli: tbeli });
              }}
              defaultValue={this.state.beli.alamat}
              placeholderTextColor={"#666872"}
              underlineColorAndroid="transparent"
              keyboardType={"default"}
              textAlignVertical={"top"}
              editable={false}
            />
          </View>

          <View
            style={{
              backgroundColor: "white",
              marginTop: 10,
              borderRadius: 10,
              padding: 10,
              marginHorizontal: 15,
            }}
          >
            <Text style={{ fontSize: 14 }}>Metode Pengiriman</Text>

            <Select
              style={{ width: WIDTH - 50 }}
              selectedValue={this.state.beli.metodepengiriman}
              onValueChange={(itemValue, itemIndex) => {}}
              enabled={false}
            >
              {this.state.optionkirim.map((v) => {
                return <Select.Item label={v.label} value={v.label} />;
              })}
            </Select>
          </View>
          <View
            style={{
              backgroundColor: "white",
              marginTop: 10,
              borderRadius: 10,
              padding: 10,
              marginHorizontal: 15,
            }}
          >
            <Text style={{ fontSize: 14 }}>Metode Pembayaran</Text>

            <Select
              style={{ width: WIDTH - 50 }}
              selectedValue={this.state.beli.metodepembayaran}
              onValueChange={(itemValue, itemIndex) => {
                var tbeli = this.state.beli;
                tbeli.metodepembayaran = itemValue;
                if (itemValue == "Bayar Tunai") {
                  tbeli.hargaadmin = this.state.optionbayarambil[0].biaya;
                  tbeli.totalharga =
                    tbeli.hargaproduk + tbeli.hargaadmin + tbeli.hargaongkir;
                } else {
                  tbeli.hargaadmin = this.state.optionbayarambil[1].biaya;
                  tbeli.totalharga =
                    tbeli.hargaproduk + tbeli.hargaadmin + tbeli.hargaongkir;
                }
                this.setState({ beli: tbeli });
              }}
              enabled={false}
            >
              {this.state.beli.metodepengiriman == "Ambil Sendiri"
                ? this.state.optionbayarambil.map((v) => {
                    return <Select.Item label={v.label} value={v.label} />;
                  })
                : this.state.optionbayarkirim.map((v) => {
                    return <Select.Item label={v.label} value={v.label} />;
                  })}
            </Select>
          </View>
          <View
            style={{
              backgroundColor: "white",
              marginTop: 10,
              borderRadius: 10,
              padding: 10,
              marginHorizontal: 15,
              marginBottom: 15,
              flexDirection: "column",
            }}
          >
            <View style={{ flex: 2, flexDirection: "row" }}>
              <Text style={{ flex: 1, textAlign: "left" }}>Total Produk</Text>
              <Text
                style={{
                  fontSize: 12,

                  flex: 1,
                  textAlign: "right",
                }}
              >
                {this.state.totalproduk}
                Produk
              </Text>
            </View>
            <View style={{ flex: 2, flexDirection: "row" }}>
              <Text style={{ flex: 1, textAlign: "left" }}>Biaya Produk</Text>
              <Text
                style={{
                  fontSize: 12,

                  flex: 1,
                  textAlign: "right",
                }}
              >
                {currencyFormatter(this.state.beli.hargaproduk ?? 0)}
              </Text>
            </View>
            <View style={{ flex: 2, flexDirection: "row" }}>
              <Text style={{ flex: 1, textAlign: "left" }}>Biaya Admin</Text>
              <Text
                style={{
                  fontSize: 12,

                  flex: 1,
                  textAlign: "right",
                }}
              >
                {currencyFormatter(this.state.beli.hargaadmin ?? 0)}
              </Text>
            </View>
            <View style={{ flex: 2, flexDirection: "row" }}>
              <Text style={{ flex: 1, textAlign: "left" }}>Biaya Kirim</Text>
              <Text
                style={{
                  fontSize: 12,

                  flex: 1,
                  textAlign: "right",
                }}
              >
                {currencyFormatter(this.state.beli.hargaongkir ?? 0)}
              </Text>
            </View>
            <View
              style={{
                borderColor: "black",
                borderWidth: 0.5,
                width: WIDTH - 50,
                alignContent: "center",
              }}
            ></View>
            <View style={{ flex: 2, flexDirection: "row" }}>
              <Text style={{ flex: 1, textAlign: "left", fontSize: 14 }}>
                Total Harga
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "bold",
                  flex: 1,
                  textAlign: "right",
                }}
              >
                {currencyFormatter(this.state.beli.totalharga ?? 0)}
              </Text>
            </View>
          </View>
          {this.state.beli != null && (
            <View
              style={{
                marginTop: 10,
                borderRadius: 10,
                padding: 10,
                marginHorizontal: 5,
              }}
            >
              <View
                style={{
                  backgroundColor: "white",

                  borderRadius: 10,
                  padding: 10,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "bold" }}>Log </Text>
                <Text style={{ fontSize: 14 }}>{this.state.beli.log} </Text>
              </View>
            </View>
          )}
          {this.state.beli != null && this.state.beli.metodepembayaran == "Transfer Bank" && (
              <View
                style={{
                  backgroundColor: "white",
                  marginVertical: 10,
                  borderRadius: 10,
                  padding: 10,
                  marginHorizontal:15
                }}
              >
               
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "bold",
                    paddingTop: 7,
                    paddingBottom: 3,
                  }}
                >
                  Data Pembayaran{" "}
                </Text>
                <Text style={{ fontSize: 14 }}>Nama Bank</Text>
                <TextInput
                  style={{ fontSize: 14, paddingVertical: 4 }}
                  placeholder={"Masukkan Nama bank yang digunakan"}
                  onChangeText={async (val) => {
                    var tbeli = this.state.beli;
                    tbeli.pembayaranbank = val;
                    await this.setState({ beli: tbeli });
                  }}
                  defaultValue={this.state.beli.pembayaranbank}
                  placeholderTextColor={"#666872"}
                  underlineColorAndroid="black"
                  keyboardType={"default"}
                  editable={false}
                  textAlignVertical={"top"}
                />
                <Text style={{ fontSize: 14 }}>Nama Pengirim</Text>
                <TextInput
                  style={{ fontSize: 14, paddingVertical: 4 }}
                  placeholder={"Masukkan Nama Pengirim yang digunakan"}
                  onChangeText={async (val) => {
                    var tbeli = this.state.beli;
                    tbeli.pembayarannama = val;
                    await this.setState({ beli: tbeli });
                  }}
                  defaultValue={this.state.beli.pembayarannama}
                  placeholderTextColor={"#666872"}
                  underlineColorAndroid="black"
                  keyboardType={"default"}
                  editable={false}
                  textAlignVertical={"top"}
                />
                <Text style={{fontSize: 14}}>Nomor Rekening</Text>
                <TextInput 
                    style={{fontSize: 14, paddingVertical:4}}
                    placeholder={"Masukkan Nomor Rekening yang digunakan"}
                    onChangeText={async (val) => {
                      var tbeli = this.state.beli;
                      tbeli.pembayarannorek = val;
                      await this.setState({beli: tbeli});
                    }}
                    defaultValue={this.state.beli.pembayarannorek}
                    placeholderTextColor={"#666872"}
                    underlineColorAndroid="black"
                    keyboardType={"default"}
                    editable={false}
                    textAlignVertical={"top"}
                />
                <Text style={{ fontSize: 14 }}>Waktu Pengiriman</Text>
                <TextInput
                  style={{ fontSize: 14, paddingVertical: 4 }}
                  placeholder={"Masukkan Tanggal Pengiriman dilakukan"}
                  onChangeText={async (val) => {
                    var tbeli = this.state.beli;
                    tbeli.pembayarantanggal = val;
                    await this.setState({ beli: tbeli });
                  }}
                  defaultValue={this.state.beli.pembayarantanggal}
                  placeholderTextColor={"#666872"}
                  underlineColorAndroid="black"
                  keyboardType={"default"}
                  editable={false}
                  textAlignVertical={"top"}
                />
              </View>
            )}
          {this.state.beli != null &&
            this.state.beli.status == "Menunggu Konfirmasi Penjual" && (
              <View
                style={{
                  marginTop: 10,
                  borderRadius: 10,
                  padding: 10,
                  marginHorizontal: 5,
                }}
              >
                <View
                  style={{
                    backgroundColor: "white",
                    marginVertical: 10,
                    borderRadius: 10,
                    padding: 10,
                  }}
                >
                  <Text style={{ fontSize: 14 }}>
                    Menunggu Penjual mengkonfirmasi ketersedian produk.{" "}
                  </Text>
                </View>

                <TouchableOpacity
                  style={{
                    padding: 10,
                    backgroundColor: "#DA0037",
                    borderRadius: 10,
                    width: WIDTH - 30,
                    alignContent: "center",
                  }}
                  onPress={this.onBatal}
                >
                  <Text style={{ color: "white", textAlign: "center" }}>
                    Batal
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    padding: 10,
                    marginTop: 10,
                    backgroundColor: "white",
                    borderRadius: 10,
                    width: WIDTH - 30,
                    alignContent: "center",
                  }}
                  onPress={this.onKonfirmasiPenjual}
                >
                  <Text style={{ color: "#F24E1E", textAlign: "center" }}>
                    Konfirmasi Produk
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          
          {this.state.beli != null &&
            this.state.beli.status == "Menunggu Konfirmasi Pembayaran" && (
              <View
                style={{
                  marginTop: 10,
                  borderRadius: 10,
                  padding: 10,
                  marginHorizontal: 5,
                }}
              >
                <View
                  style={{
                    backgroundColor: "white",
                    marginVertical: 10,
                    borderRadius: 10,
                    padding: 10,
                  }}
                >
                  <Text style={{ fontSize: 14 }}>
                    Menunggu Penjual mengkonfirmasi pembayaran{" "}
                  </Text>
                 
                </View>

                <TouchableOpacity
                  style={{
                    padding: 10,
                    backgroundColor: "#DA0037",
                    borderRadius: 10,
                    width: WIDTH - 30,
                    alignContent: "center",
                  }}
                  onPress={this.onBatal}
                >
                  <Text style={{ color: "white", textAlign: "center" }}>
                    Batal
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    padding: 10,
                    backgroundColor: "white",
                    borderRadius: 10,
                    marginTop: 10,
                    width: WIDTH - 30,
                    alignContent: "center",
                  }}
                  onPress={this.onKonfirmasiPembayaran}
                >
                  <Text style={{ color: "#F24E1E", textAlign: "center" }}>
                    Konfimrasi Pembayaran
                  </Text>
                </TouchableOpacity>
              </View>
            )}
        </ScrollView>
      </View>
    );
  }
}

export default BeliKonfirmasiTokoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
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

  btnEye: {
    position: "absolute",
    top: 8,
    right: 37,
  },
});
