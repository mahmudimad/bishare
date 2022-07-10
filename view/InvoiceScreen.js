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
import BishareNoBackground from "./../assets/Bishare_nobg.png"

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
const BiayaAdmin = 5000;


export class InvoiceScreen extends React.Component {
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

    handleConfirm = (date) => {
      this.setState({ DateDisplay: date });
      this.setState({ visibility: false });
      this.setState({ TextInputDisableStatus: true });
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

    

    setDataInvoice = async() => {
      await firebase
        .database()
        .ref("produk/" + tproduk.produkid)
        .set(tproduk);
    }

    getDataInvoice = async() => {
      await firebase
        .database()
        .ref("produklike/" + selectedproduk.produkid + "/" + tuser.userid)
        .on("value", (snapshot) => {

          if (snapshot != null && snapshot.val() != null
          ) {
            tproduklike = {
              key: snapshot.key,
              islike: snapshot.val().islike ?? false,
              userid: snapshot.val().userid ?? tuser.userid,
              produkid: snapshot.val().produkid ?? selectedproduk.produkid,
            };

            this.setState({ produklike: tproduklike });
          }

        });
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

    

    _renderProduk = ({ item }) => {
  
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
        <View>
          <Text>
            {item.produkname}
          </Text>
        </View>
      );
    };

    _renderGambarProduk = ({ item }) => {
      var uriimage =
        "https://firebasestorage.googleapis.com/v0/b/bishare-48db5.appspot.com/o/adaptive-icon.png?alt=media&token=177dbbe3-a1bd-467e-bbee-2f04ca322b5e";
      var fill = false;
      if (item.mediaurl != null && item.mediaurl != "") {
        uriimage = item.mediaurl;
      }
      if (item.dlt == true) {
        return;
      }
      return(     
            <View>
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
        
      )
    }

    async componentDidMount() {
      var tsuer = await getData("user");
      this.setState({ user: tsuer });
      await this.LoadBeli();
    }

    render() {
      const {produklike, beli, totalproduk} = this.state
        return (
        <View style={styles.container}>
            <ScrollView>   
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
                <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 20, color: "#01937C"}}>
                Invoice - {beli.username}
                </Text>
                <Text></Text>
            </View>
            <View>
            <View style={{
              backgroundColor: "white",
              marginVertical: 10,
              borderRadius: 10,
              padding: 10,
              marginHorizontal: 10,
              borderWidth:1,

            }}>
                <FlatList
                  data={this.state.beli.produklist}
                  extraData={this.state.refresh}
                  style={{
                    paddingHorizontal: 10,
                    backgroundColor: "#F6F6F6",
                  }}
                  ListEmptyComponent={this.renderEmptyContainer()}
                  contentContainerStyle={{ justifyContent: "space-between" }}
                  renderItem={this._renderGambarProduk}
                  keyExtractor={(item) => item.produkid.toString()}
                  onRefresh={() => this.LoadBeli()}
                  refreshing={this.state.isFetching}
                  scrollEnabled={false}
                />
                <View style={{marginBottom: 20,marginLeft: 20}}>
                    <View style={styles.descProduk}>
                        <Text style={{fontWeight: "bold"}}>Penjual: </Text>
                    </View>
                    <View>
                      <Text>{beli.tokoname}</Text>
                    </View>
                    <View style={styles.descTujuan}>
                        <Text style={{fontWeight:'bold'}}>Tujuan Pengiriman: </Text>
                    </View>
                    <View >
                        <Text>{beli.alamat}</Text>
                    </View>
                    <View style={styles.descTujuan}>
                        <Text style={{fontWeight:'bold'}}>Tanggal Pembayaran: </Text>
                    </View>
                    <View >
                        <Text>{beli.pembayarantanggal}</Text>
                    </View>
                </View>
                  
                <View style={{borderWidth: 1,marginVertical: 20}}/>
                  
                <View style={styles.tabelContainer}>
                    <View style={styles.produkTabel}>
                        <Text>Nama Produk</Text>
                        <Text>Jumlah</Text>
                    </View>
                    <View style={styles.detailproduk}>
                    <FlatList
                      data={this.state.beli.produklist}
                      extraData={this.state.refresh}
                      ListEmptyComponent={this.renderEmptyContainer()}
                      contentContainerStyle={{ justifyContent: "space-between" }}
                      renderItem={this._renderProduk}
                      keyExtractor={(item) => item.produkid.toString()}
                      onRefresh={() => this.LoadBeli()}
                      refreshing={this.state.isFetching}
                      scrollEnabled={false}
                    />
                        <Text>{totalproduk}</Text>
                    </View>
                </View>
                <View style={styles.tabelContainer}>
                    <View style={styles.produkTabel}>
                        <Text>Harga Barang</Text>
                        <Text>Subtotal</Text>
                    </View>
                    <View style={styles.detailharga}>
                        <Text>{currencyFormatter(beli.hargaproduk/totalproduk ?? 0)}</Text>
                        <Text>{currencyFormatter(beli.hargaproduk ?? 0)}</Text>
                    </View>
                    <View style={{borderWidth: 0.5,marginVertical:5, marginHorizontal: 10, borderColor:'grey'}}/>
                    <View style={styles.detailharga}>
                        <Text style={{fontWeight:"bold"}}>Subtotal Harga Produk</Text>
                        <Text style={{fontWeight:"bold"}}>{currencyFormatter(beli.hargaproduk ?? 0)}</Text>
                    </View>
                </View>
                <View style={styles.tabelContainer}>
                    <View style={styles.detailharga}>
                        <Text>Metode - {beli.metodepembayaran}</Text>
                        <Text>{currencyFormatter(beli.hargaongkir ?? 0)}</Text>
                    </View>
                    <View style={{borderWidth: 0.5,marginVertical:5, marginHorizontal: 10, borderColor:'grey'}}/>
                    <View style={styles.detailharga}>
                        <Text style={{fontWeight:"bold"}}>Subtotal Ongkos Kirim</Text>
                        <Text style={{fontWeight:"bold"}}>{currencyFormatter(beli.hargaongkir ?? 0)}</Text>
                    </View>
                </View>
                <View style={styles.tabelContainer}>
                    <View style={styles.detailharga}>
                        <Text>Biaya - Admin</Text>
                        <Text>{currencyFormatter(beli.hargaadmin ?? 0)}</Text>
                    </View>
                    <View style={{borderWidth: 0.5,marginVertical:5, marginHorizontal: 10, borderColor:'grey'}}/>
                    <View style={styles.detailharga}>
                        <Text style={{fontWeight:"bold"}}>Subtotal Biaya Admin</Text>
                        <Text style={{fontWeight:"bold"}}>{currencyFormatter(beli.hargaadmin ?? 0)}</Text>
                    </View>
                </View>
                <View style={styles.tabelContainer}>
                    <View style={styles.detailharga}>
                        <Text style={{fontWeight:"bold"}}>Total Pembayaran</Text>
                        <Text style={{fontWeight:"bold"}}>{currencyFormatter(beli.totalharga ?? 0)}</Text>
                    </View>
                </View>
                <View style={styles.tabelContainer}>
                    <View style={styles.status}>
                        <Text style={{fontWeight:"bold", color: "#01937C"}}>Status Pembelian - {beli.status}</Text>
                    </View>
                </View>
            </View>
            </View>
            
            <View>
              <Image source={BishareNoBackground}
              style={{ 
                  height: 200, 
                  alignContent: "flex-start",
                  alignSelf: "center",
                  width: 200,
                  resizeMode: 'contain',
                  marginTop: -70,
                  marginBottom: -60,
              }}/>
            </View>
            </ScrollView>       
        </View>
        )
    }
}

export default InvoiceScreen

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: "#F6F6F6",
    },
    descProduk:{
        flexDirection:"row",
        marginRight: 10,
    },
    descTujuan:{
        marginRight: 10,
        marginTop: 10,
    },
    tabelContainer:{
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 20,
    },
    produkTabel:{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: "#ebebeb",
        borderTopRightRadius: 4,
        borderTopLeftRadius: 4,
        width:378.5,
    },
    detailproduk:{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingLeft: 20,
        paddingRight: 45,
        paddingVertical: 10,

    },
    detailharga:{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingLeft: 20,
        paddingRight: 10,
        paddingVertical: 10,
    },
    status:{
      flexDirection: "row",
        justifyContent: "center",
        paddingLeft: 20,
        paddingRight: 10,
        paddingVertical: 10,
    }
})