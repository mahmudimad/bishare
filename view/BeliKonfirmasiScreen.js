import { StatusBar } from "expo-status-bar";
import React, { Component, useState, useEffect } from "react";
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
  Platform,
  Modal,
  Pressable,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Icon from "react-native-vector-icons/Ionicons";
import moment from "moment";
import * as firebase from "firebase";
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Picker as Select } from "@react-native-community/picker";
import * as ImagePicker from 'expo-image-picker';

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

function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
}

class BeliKonfirmasiScreen extends React.Component {

  setModalVisible = (visible) => {
    this.setState({ modalVisible: visible });
  }

  onChooseCameraPress = async () =>{
    let result = await ImagePicker.launchCameraAsync();
  
    if(!result.cancelled){
      this.uploadImage(result.uri, "Upload")
        .then(()=>{
          Alert.alert("Upload Bukti Pembayaran Sukses")
        })
        .catch((error)=>{
          Alert.alert('Error:', error.message)
        })
    }
  }

  onChooselibraryPress = async () =>{
    let result = await ImagePicker.launchImageLibraryAsync();

    if(!result.cancelled){
      this.uploadImage(result.uri, "Upload")
        .then(()=>{
          Alert.alert("Upload Bukti Pembayaran Sukses")
        })
        .catch((error)=>{
          Alert.alert('Error:', error.message)
        })
    }
  }

  uploadImage = async (uri, imageName) => {
    var tbeli = this.state.beli;
    const response = await fetch (uri);
    const blob = await response.blob();
    var ref = firebase.storage().ref().child("UploadPembayaran/Image/Upload/"+tbeli.username+imageName)
    tbeli.buktipembayaran = uri
    await this.setState({ beli: tbeli });
    await firebase
      .database()
      .ref("beli/" + tbeli.key)
      .set(tbeli);
    
    return ref.put(blob);
  }

  constructor() {
    super();

    this.state = {
      modalVisible: false,
      press: false,
      visibility: false,
      DateDisplay: "",
      TextInputDisableStatus: true,
      displayFormat: "DD-MM-YYYY",
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

  handleConfirmTglLahir = (date) => {
    var tbeli = this.state.beli;
    tbeli.pembayarantanggal = formatDate(date) ;
    this.setState({ beli: tbeli })  
    this.setState({ pembayarantanggal: date });
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
              tbeli.log += tuser.nama + ": Batal " + this.GetDateTime() + "\n";
              tbeli.status = "User Batal";
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
  onTerima = async () => {
    const { navigation } = this.props;

    Alert.alert(
      "Konfirmasi",
      "Apakah anda yakin sudah menerima produk, dan menyelesaikan pembelian ?",

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
                tuser.nama +
                ": Produk Diterima, selesai. " +
                this.GetDateTime() +
                "\n";
              tbeli.status = "Selesai";
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
  onBayar = async () => {
    const { navigation } = this.props;
    var tbeli = this.state.beli;
    var tuser = this.state.user;
    if(tbeli.pembayaranbank == ""){
      this.notify("Bank kosong");
      return;
    }
    if(tbeli.pembayarannama == ""){
      this.notify("Nama pengirim kosong");
      return;
    }
    if(tbeli.pembayarannorek == ""){
      this.notify("Nomor rekening pengirim kosong");
      return;
    }
    if(tbeli.pembayarantanggal == ""){
      this.notify("Tanggal kosong");
      return;
    }
   
    Alert.alert(
      "Konfirmasi",
      "Apakah anda yakin sudah melakukan pembayaran sesuai jumlah ?",

      [
        {
          text: "Tidak",
          style: "tidak",
        },
        {
          text: "Ya",
          onPress: async () => {
            try {
              
              tbeli.log +=
                tuser.nama +
                ": Pembayaran sudah dilakukan. " +
                this.GetDateTime() +
                "\n";
              tbeli.status = "Menunggu Konfirmasi Pembayaran";
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

  onSelesai = async () => {
    const { navigation } = this.props;
    var tbeli = this.state.beli;
    var tuser = this.state.user;
   
    Alert.alert(
      "Konfirmasi",
      "Pembayaran Anda Sudah Selesai",

      [
        {
          text: "Lanjutkan",
          onPress: async () => {
            try {
              
              tbeli.log +=
                tuser.nama +
                ": Pembelian Selesai " +
                this.GetDateTime() +
                "\n";
              tbeli.status = "Selesai";
              tbeli.belidate = Date.now();
             

              await firebase
                .database()
                .ref("beli/" + tbeli.key)
                .set(tbeli);

              navigation.push("Invoice");
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

  getDataInvoice = async(selectedproduk) => {
    const { navigation } = this.props;
    var tbeli = this.state.beli;
    var tuser = this.state.user;
    await firebase
      .database()
      .ref("beli/" + selectedproduk.tokoid)
      .on("value", (snapshot) => {

        if (snapshot != null && snapshot.val() != null
        ) {
          tproduklike = {
            key: snapshot.key,
            dlt: snapshot.val().dlt ?? false,
            userid: snapshot.val().userid ?? tbeli.userid,
            tokoid: snapshot.val().tokoid ?? tbeli.tokoid,
          };

          this.setState({ beli: tbeli });
        }

      });

    Alert.alert(
      "Konfirmasi",
      "Pembelian Anda Telah Selesai",

      [
        {
          text: "Lanjutkan",
          onPress: async () => {
            try {
              
              tbeli.log +=
                tuser.nama +
                ": Pembelian Selesai " +
                this.GetDateTime() +
                "\n";
              tbeli.status = "Selesai";
              tbeli.belidate = Date.now();

              await firebase
                .database()
                .ref("beli/" + tbeli.key)
                .set(tbeli);

              navigation.push("Invoice", { params: tbeli });
            } catch (error) {
              console.error(error);
            }
          },
        },
      ]
    );
  }

  _renderGambarProduk = ({ item }) => {
    var tbeli =this.state.beli;
    var uriimage 
    var fill = false;
    if (tbeli.buktipembayaran != null && tbeli.buktipembayaran != "") {
      uriimage = tbeli.buktipembayaran;
    }
    if (tbeli.dlt == true) {
      return;
    }

    return(
      <View>    
          {this.state.beli.buktipembayaran != "" &&(
          <View 
            style={styles.borderBukti}
          >
            <Image
              style={{ 
                height: 300, 
                alignContent: "flex-start",
                alignSelf: "center",
                width: 300,
                resizeMode: 'contain'
            }}
              resizeMode={"contain"}
              source={{ uri: uriimage }}
            />
          </View>
          )}  
      </View>
      
    )
  }

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

  GetDate = () => {
    var today = new Date();
    var date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    return date ;
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
    if (status == "Proses Pengiriman") return "#185ADB";
    if (status == "Menunggu Pesanan Diterima") return "#185ADB";
    if (status == "Menunggu Pengambilan") return "#185ADB";
    if (status == "Selesai") return "#01937C";
    else return "black";
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
    const { modalVisible } = this.state;
    const { navigation, getKotaResult, registerLoading } = this.props;
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
              onValueChange={(itemValue, itemIndex) => {
                var tbeli = this.state.beli;
                // tbeli.metodepengiriman = itemValue;
                //
                // 
                if (itemValue == "Kirim") {
                  tbeli.hargaongkir = this.state.optionkirim[1].biaya;
                  tbeli.totalharga =
                    tbeli.hargaproduk + tbeli.hargaadmin + tbeli.hargaongkir;
                } else {
                  tbeli.metodepembayaran = this.state.optionbayarambil[1].label;
                  tbeli.hargaadmin = this.state.optionbayarambil[1].biaya;
                  tbeli.hargaongkir = this.state.optionkirim[0].biaya;
                  tbeli.totalharga =
                    tbeli.hargaproduk + tbeli.hargaadmin + tbeli.hargaongkir;
                }
                this.setState({ beli: tbeli });
              }}
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
                {this.state.totalproduk} Produk
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
          {this.state.beli != null && this.state.beli.status != "Draft" && (
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
          {this.state.beli != null && 
          this.state.beli.status != "Selesai" &&
          this.state.beli.metodepembayaran == "Transfer Bank" && (
              <View
                style={{
                  backgroundColor: "white",
                  marginVertical: 10,
                  marginHorizontal:15,
                  borderRadius: 10,
                  padding: 10,
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
                <Text style={{ fontSize: 14 }}>Nomor Rekening</Text>
                <TextInput
                  style={{ fontSize: 14, paddingVertical: 4 }}
                  placeholder={"Masukkan Nomor Rekening yang digunakan"}
                  onChangeText={async (val) => {
                    var tbeli = this.state.beli;
                    tbeli.pembayarannama = val;
                    await this.setState({ beli: tbeli });
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
          this.state.beli.status != "User Batal" && 
          this.state.beli.status != "Penjual Batal" && 
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
              </View>
            )}
          {this.state.beli != null && this.state.beli.status != "User Batal" && this.state.beli.status == "Menunggu Konfirmasi Pembayaran" && (
          
          //<View>  
          //  <View style={{
          //    backgroundColor: "white",
          //    marginVertical: 10,
          //    borderRadius: 10,
          //    padding: 10,
          //    marginHorizontal:15
          //  }}>
          //    <View>
          //      <Text style={{fontWeight:"bold", fontSize: 14}}>Upload Bukti Pembayaran</Text>
          //    </View>
          //    <View style={{marginTop: 10}}>
          //      <View style={{ width:WIDTH - 55,flexDirection:'row'}}>
          //        <Modal
          //          animationType="fade"
          //          transparent={true}
          //          visible={modalVisible}
          //          onRequestClose={() => {
          //            const { modalVisible } = this.state;
          //            Alert.alert("Modal has been closed.");
          //            this.setModalVisible(!modalVisible);
          //          }}
          //        >
          //          <View style={styles.centeredView}>
          //            <View style={styles.modalView}>
          //              <Text style={styles.modalText}>Select Image</Text>
          //                <View style={{flexDirection: 'column'}}>
          //                  <TouchableOpacity onPress={this.onChooselibraryPress}>
          //                    <Text style={styles.SelectModal}>Select File...</Text>
          //                  </TouchableOpacity>
          //                  <TouchableOpacity onPress={this.onChooseCameraPress}>
          //                    <Text style={styles.SelectModal}>Launch Camera...</Text>
          //                  </TouchableOpacity>
          //                </View>     
          //                <Pressable
          //                  onPress={() =>{
          //                    const { modalVisible } = this.state;
          //                    this.setModalVisible(!modalVisible);
          //                  }}
          //                >
          //                  <Text style={{color:'black', alignSelf:'flex-end', fontWeight: 'bold'}}>CANCEL</Text>
          //                </Pressable>
          //            </View>
          //          </View>
          //        </Modal>
          //        <TouchableOpacity style={{
          //          marginTop: 15,
          //          padding: 10,
          //          backgroundColor: "#185ADB",
          //          borderRadius: 10,
          //          width: WIDTH - 55,
          //          alignItems: "center",
          //          alignSelf:"center"
          //          }}
          //          onPress={()=>{
          //            const { modalVisible } = this.state;
          //            this.setModalVisible(true);
          //          }}  
          //        >
          //          <Text style={{fontSize:14,paddingHorizontal: 10, color: "white"}} >
          //            Upload Bukti
          //          </Text>
          //        </TouchableOpacity>
          //        <Text style={{color: "#d8d8d8",marginTop:5}} ></Text>
          //      </View>    
          //    </View>
          //  </View>
          //</View>  

          <View>

          </View>

          )}
          {this.state.beli != null &&
            this.state.beli.status != "User Batal" &&
            this.state.beli.status != "Penjual Batal" &&
            this.state.beli.status == "Menunggu Pengambilan" && (
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
                    Menunggu Pembeli Mengambil Produk.{" "}
                  </Text>
                </View>

                <TouchableOpacity
                  style={{
                    padding: 10,
                    backgroundColor: "#F24E1E",
                    borderRadius: 10,
                    width: WIDTH - 30,
                    alignContent: "center",
                  }}
                  onPress={this.onTerima}
                >
                  <Text style={{ color: "white", textAlign: "center" }}>
                    Produk Diterima
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          {this.state.beli != null &&
            this.state.beli.status != "User Batal" &&
            this.state.beli.status != "Penjual Batal" &&
            this.state.beli.status == "Menunggu Pembayaran" && (
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
                    Silahkan melakukan pembayaran sesuai data dibawah lalu
                    mengisi info pembayaran untuk dapat dikonfirmasi{" "}
                  </Text>
                  <Text style={{fontSize: 14, fontWeight:"bold",marginTop: 10}}>Kirim ke rek :</Text>
                  <Text style={{ fontSize: 14 }}>BCA : 763482634981623786 </Text>
                  <Text style={{ fontSize: 14 }}>
                    Atas nama : Bishare
                  </Text>
                  <Text></Text>
                  <Text style={{ fontSize: 14 }}>Nama Bank</Text>
                  <TextInput
                    style={{ fontSize: 14,paddingVertical:4 }}
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
                    textAlignVertical={"top"}
                  />
                  <Text style={{ fontSize: 14 }}>Nama Pengirim</Text>
                  <TextInput
                    style={{ fontSize: 14,paddingVertical:4 }}
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
                    textAlignVertical={"top"}
                  />
                    <Text style={{ fontSize: 14 }}>Waktu Pengiriman</Text>
                  <TextInput
                    style={{ fontSize: 14,paddingVertical:4 }}
                    placeholder={"Masukkan Tanggal Pengiriman dilakukan"}
                    onChangeText={async (val) => {
                      var tbeli = this.state.beli;
                      tbeli.pembayarantanggal = val;
                      moment(tbeli.pembayarantanggal).format(this.state.displayFormat)
                      await this.setState({beli: tbeli});
                    }}
                    value={ 
                      this.state.beli.pembayarantanggal ? moment(this.state.beli.pembayarantanggal).format(this.state.displayFormat)
                      : ""
                    }
                    defaultValue={this.state.beli.pembayarantanggal}
                    editable={this.state.TextInputDisableStatus}
                    pointerEvents="none"
                    selectTextOnFocus={false}
                    onTouchStart={this.onPressButton}
                    placeholderTextColor={"#666872"}
                    underlineColorAndroid="black"
                    textAlignVertical={"top"}
                  />
                  <DateTimePickerModal
                    mode="date"
                    isVisible={this.state.visibility}
                    onConfirm={this.handleConfirmTglLahir}
                    onCancel={this.onPressCancel}
                  />
                </View>

                <View>  
                  <View style={{
                    backgroundColor: "white",
                    marginVertical: 10,
                    borderRadius: 10,
                    padding: 10,
                  }}>
                    <View>
                      <Text style={{fontWeight:"bold", fontSize: 14}}>Upload Bukti Pembayaran</Text>
                    </View>
                    <View style={{marginTop: 10}}>
                      <View style={{ width:WIDTH - 55,flexDirection:'row'}}>
                        <Modal
                          animationType="fade"
                          transparent={true}
                          visible={modalVisible}
                          onRequestClose={() => {
                            const { modalVisible } = this.state;
                            Alert.alert("Modal has been closed.");
                            this.setModalVisible(!modalVisible);
                          }}
                        >
                          <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                              <Text style={styles.modalText}>Select Image</Text>
                                <View style={{flexDirection: 'column'}}>
                                  <TouchableOpacity onPress={this.onChooselibraryPress}>
                                    <Text style={styles.SelectModal}>Select File...</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity onPress={this.onChooseCameraPress}>
                                    <Text style={styles.SelectModal}>Launch Camera...</Text>
                                  </TouchableOpacity>
                                </View>     
                                <Pressable
                                  onPress={() =>{
                                    const { modalVisible } = this.state;
                                    this.setModalVisible(!modalVisible);
                                  }}
                                >
                                  <Text style={{color:'black', alignSelf:'flex-end', fontWeight: 'bold'}}>CANCEL</Text>
                                </Pressable>
                            </View>
                          </View>
                        </Modal>
                        <View style={{flexDirection: "column"}}>
                          <FlatList
                              data={this.state.beli.produklist}
                              extraData={this.state.refresh}
                              ListEmptyComponent={this.renderEmptyContainer()}
                              contentContainerStyle={{ justifyContent: "space-between" }}
                              renderItem={this._renderGambarProduk}
                              keyExtractor={(item) => item.produkid.toString()}
                              onRefresh={() => this.LoadBeli()}
                              refreshing={this.state.isFetching}
                              scrollEnabled={false}
                          />
                          <TouchableOpacity style={{
                            marginTop: 15,
                            padding: 10,
                            backgroundColor: "#808080",
                            borderRadius: 10,
                            width: WIDTH - 55,
                            alignItems: "center",
                            alignSelf:"center"
                            }}
                            onPress={()=>{
                              const { modalVisible } = this.state;
                              this.setModalVisible(true);
                            }}  
                          >
                            <Text style={{fontSize:14,paddingHorizontal: 10, color: "white"}} >
                              Upload Bukti
                            </Text>
                          </TouchableOpacity>         
                        </View>
                        
                        <Text style={{color: "#d8d8d8",marginTop:5}} ></Text>
                      </View>    
                    </View>
                  </View>
                </View> 

                <TouchableOpacity
                  style={{
                    padding: 10,
                    backgroundColor: "#F24E1E",
                    borderRadius: 10,
                    width: WIDTH - 30,
                    alignContent: "center",
                  }}
                  onPress={this.onBayar}
                >
                  <Text style={{ color: "white", textAlign: "center" }}>
                    Pembayaran Dikirim
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            {this.state.beli != null &&
            this.state.beli.status != "User Batal" &&
            this.state.beli.status != "Penjual Batal" &&
            this.state.beli.status == "Selesai" && (
              <View style={{
                borderRadius: 10,
                padding: 10,
                marginHorizontal: 5,
              }}>
                <View
                  style={{
                    backgroundColor: "white",
                    marginVertical: 10,
                    borderRadius: 10,
                    padding: 10,
                  }}
                >
                  <Text style={{fontWeight:'bold', marginBottom: 10}}>Invoice</Text>
                  <Pressable style={({pressed}) =>[{
                      backgroundColor: pressed ? "#FCD7CC" : "#F24E1E"
                    },
                    {
                      padding: 10,
                      borderRadius: 10,
                      width: WIDTH - 50,
                      alignContent: "center",
                      marginBottom: 5,
                    },
                  ]}
                  onPress={this.getDataInvoice}          
                  >
                    <Text style={{color:"white", alignSelf: 'center'}}>Invoice</Text>
                  </Pressable>
                </View>
              </View>
            )}
        </ScrollView>
      </View>
    );
  }
}



export default BeliKonfirmasiScreen;



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
  SelectModal:{
    fontSize: 18,
    width: 200,
    marginBottom: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    shadowColor: "#000",
    padding:15,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalText: {
    fontSize:18,
    marginBottom: 20,
    fontWeight: "bold"
  },
  borderBukti:{   
      borderWidth: 1,
      borderColor: "black",    
  },
  noBorder:{

  },
});
