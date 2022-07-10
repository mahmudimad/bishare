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
  Share,
  FlatList,
  ImageBackground,
  ScrollView,
  ToastAndroid,
  ActivityIndicator,
} from "react-native";
import { WebView } from 'react-native-webview';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Icon from "react-native-vector-icons/Ionicons";
import moment from "moment";
import * as firebase from "firebase";
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Rating, AirbnbRating } from 'react-native-ratings';


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

class ProdukDetailScreen extends React.Component {
  constructor() {
    super();

    this.state = {
      press: false,
      isLoading: false,
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
      produkmedia: [],
      produk: {
        deskripsi: "Loading...........",
        harga: "...........",
        key: "0",
        produkcode: "...........",
        produkid: 0,
        deskripsi: "----------------------",
        fitur: "----------------------",
        spesifikasi: "----------------------",
        stok: 0,
        produkmedia: {},
        produkname: "...........",
        tokoname: ""
      },
      reviewavg: 0
    };
  }

  onSubmit = async () => {
    const { navigation } = this.props;
  };

  onPressCancel = () => {
    this.setState({ visibility: false });
    this.setState({ TextInputDisableStatus: true });
  };
  onShare = async () => {
    var url = this.state.firstmedia;
    
    var shareoption = {
      title: this.state.produk.produkname,
      message: this.state.produk.produkname + "\nHarga : " + this.state.produk.harga + "\n" + this.state.produk.deskripsi + "\nBishare - Marketplace Polibatam",
      url: this.state.firstmedia
    }
    Share.share(shareoption)
      .then((res) => {
        
      })
      .catch((err) => {
          
        });

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


  handleConfirm = (date) => {
    this.setState({ DateDisplay: date });
    this.setState({ visibility: false });
    this.setState({ TextInputDisableStatus: true });
  };
  onLogin = async () => {
    const { navigation } = this.props;
    navigation.push("Login");
  };
  onLike = async () => {
    var tproduklike = this.state.produklike;
    var tproduk = this.state.produk;
    var tuser = this.state.user;
    tproduklike.islike = !tproduklike.islike;
    if (tproduklike.islike) {
      //this.notify("❤ + 1");
      tproduk.likecount += 1;
    }
    else {
      //this.notify("❤ - 1");
      tproduk.likecount -= 1;
    }
    this.setState({
      produklike: tproduklike,
      produk: tproduk
    });

    try {

      await firebase
        .database()
        .ref("produklike/" + tproduk.produkid + "/" + tuser.userid)
        .set(tproduklike);
      await firebase
        .database()
        .ref("produk/" + tproduk.produkid)
        .set(tproduk);
    } catch (error) {
      console.error(error);
    }


  };
  onKeranjang = async () => {
    var tkeranjang = this.state.keranjang;
    var tproduk = this.state.produk;
    var tuser = this.state.user;
    if (tkeranjang == null || tkeranjang.produkid == "") {
      tkeranjang = {
        key: tproduk.produkid,
        dlt: true,
        produkid: tproduk.produkid,
        userid: tuser.userid,
        mediaurl: this.state.firstmedia,
        produkname: tproduk.produkname,
        stok: 0,
        tokoid : tproduk.tokoid,
        tokoname: tproduk.tokoname,
        harga: tproduk.harga
      }
    }

    if (tkeranjang.dlt || tkeranjang.stok <= 0) {
      
      tkeranjang.dlt = false;
      tkeranjang. tokoid =tproduk.tokoid;
      tkeranjang.tokoname= tproduk.tokoname;
      tkeranjang.stok = 1;
      this.notify("Produk berhasil dimasukkan kedalam keranjang");

      this.setState({
        keranjang: tkeranjang,

      });

      try {

        await firebase
          .database()
          .ref("keranjang/" + tuser.userid + "/" + tproduk.produkid)
          .set(tkeranjang);

      } catch (error) {
     //   console.error(error);
      }
    }
    else {
      const { navigation } = this.props; navigation.push("Keranjang");
    }



  };

  OnReview = () => {
    const { navigation } = this.props;
    navigation.push("Review", { params: this.state.produk });
  };

  getProduk = async () => {
    const { navigation, route } = this.props;
    const { params: selectedproduk } = route.params;
    var tuser = this.state.user;
    if (tuser == null)
      tuser = await getData("user");

     
      

    var firstmedia = "https://firebasestorage.googleapis.com/v0/b/bishare-48db5.appspot.com/o/adaptive-icon.png?alt=media&token=177dbbe3-a1bd-467e-bbee-2f04ca322b5e";
    var tempproduk = [];
    if(selectedproduk.youtubevideo !== undefined && selectedproduk.youtubevideo != null && selectedproduk.youtubevideo != ""){
        
      var SplitedVideo = selectedproduk.youtubevideo.split("watch?v=")
      
      selectedproduk.youtubevideo = SplitedVideo.join("embed/") ;
      tempproduk.push({
        key: 0,
        mediaid: 0,
        mediaurl:  selectedproduk.youtubevideo,
        isvideo : true,
      });
    }
    if (selectedproduk.produkmedia == null) {
      tempproduk.push({
        key: 0,
        mediaid: 0,
        mediaurl: "https://firebasestorage.googleapis.com/v0/b/bishare-48db5.appspot.com/o/adaptive-icon.png?alt=media&token=177dbbe3-a1bd-467e-bbee-2f04ca322b5e",
        isvideo : false,
      });
    } else if (typeof selectedproduk.produkmedia === "object") {
      if (
        Object.keys(selectedproduk.produkmedia) != null &&
        Object.keys(selectedproduk.produkmedia).length >= 1
      ) {
        var i = 0;
        Object.values(selectedproduk.produkmedia).forEach(function (
          produkmedia
        ) {
          if (
            produkmedia != null &&
            produkmedia.dlt == false &&
            produkmedia.mediaurl != ""
          ) {
            if (i == 0) {
              firstmedia = produkmedia.mediaurl
            }
            tempproduk.push({
              key: i++,
              mediaid: produkmedia.mediaid,
              mediaurl: produkmedia.mediaurl,
              isvideo : false,
            });
          }
        });
      }
    }

    this.setState({
      produk: selectedproduk,
      reviewavg: selectedproduk.reviewavg ?? 0,
      produkmedia: tempproduk,
      refresh: !this.state.refresh,
      firstmedia: firstmedia,
    });
    var tproduklike = null;
    var tkeranjang = null;

    try {

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
    } catch (error) {
      //console.error(error);
    }

    try {
      await firebase
        .database()
        .ref("keranjang/" + tuser.userid + "/" + selectedproduk.produkid)
        .on("value", (snapshot) => {
          if (snapshot != null && snapshot.val() != null
          ) {
            tkeranjang = {
              key: snapshot.key,
              dlt: snapshot.val().dlt ?? false,
              produkid: snapshot.val().produkid ?? selectedproduk.produkid,
              userid: snapshot.val().userid ?? tuser.userid,
              mediaurl: firstmedia,
              produkname: selectedproduk.produkname,
              stok: snapshot.val().stok ?? 0,
              harga: selectedproduk.harga
            };

            this.setState({ keranjang: tkeranjang });
          }

        });
    } catch (error) {
      //console.error(error);
    }

    if (tproduklike == null) {
      tproduklike = {
        key: tuser.userid,
        islike: false,
        userid: tuser.userid,
      }
    }
    if (tkeranjang == null) {
      tkeranjang = {
        key: selectedproduk.produkid,
        dlt: true,
        produkid: selectedproduk.produkid,
        userid: tuser.userid,
        mediaurl: firstmedia,
        produkname: selectedproduk.produkname,
        stok: 0,
        harga: selectedproduk.harga
      }
    }
    this.setState({ user: tuser, produklike: tproduklike });
    //storeData("produk", tempproduk);

  };

  OnToko = () => {
    const { navigation } = this.props;
    navigation.push("Toko", { params: this.state.produk.tokoid });
  };
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
    navigation.push("ChatDetail", { params: tuserchats });

  };


  _renderItem = ({ item }) => {
    if(item.isvideo){
      return (
        <TouchableOpacity onPress={async (xitem) => { }}>
          <WebView
              style={{flex:1,height:100,width:WIDTH-20,marginHorizontal:10,borderRadius:50}}    
                  javaScriptEnabled={true}
                  source={{uri: item.mediaurl}}
              />
        </TouchableOpacity>
      );
    }
    else {
      return (
        <TouchableOpacity onPress={async (xitem) => { }}>
          <Image
            source={{ uri: item.mediaurl }}
            style={{
  
              height: HEIGHT / 2 - 20,
              width: WIDTH - 30,
              marginHorizontal: 10,
              borderWidth: 0,
              borderRadius: 20,
  
            }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      );
    }
   
  };

  OnKategoriDetail = () => {
    
    var tkategori = [];

    firebase
    .database()
    .ref("kategori/"+this.state.produk.kategoriid)    
    .on("value", (snapshot) => {
      tkategori = snapshot.val();
      if(tkategori.key != "Rekomendasi" && tkategori.key != "All"){
        const { navigation } = this.props;
        navigation.push("KategoriDetail", { params: tkategori });
      }  
    });

     
  };

  async componentDidMount() {
    var tsuer = await getData("user");
    this.setState({ user: tsuer });
    await this.getProduk();
  }

  render() {
    const { navigation } = this.props;
    return (
      <View style={styles.container}>
        <SafeAreaView>
          <ScrollView style={{}}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingTop: 10,

              }}
            >
              <View style={{ marginTop: 20 }}>
                <TouchableOpacity onPress={() => { const { navigation } = this.props; navigation.goBack(); }}>
                  <Icon name={"chevron-back-outline"} size={25} color={"#666872"} />
                </TouchableOpacity>
              </View>

              <View style={{ marginTop: 20 }}>
                <TouchableOpacity onPress={() => { const { navigation } = this.props; navigation.push("Keranjang"); }}>
                  <Icon name={"cart"} size={25} color={"#666872"} />
                </TouchableOpacity>

              </View>
            </View>
            <ActivityIndicator size="large" color="#F24E1E" animating={this.state.isLoading} style={{position:"absolute", top:HEIGHT/2,left:(WIDTH/2) -20}} />
            <View style={{ paddingHorizontal: 20, marginTop: 20 }}>

              <Text style={{ fontSize: 28, color: "black", fontWeight: "bold" }}              >
                {this.state.produk.produkname}
              </Text>
              <Text
                style={{ fontSize: 14, color: "#F24E1E", fontWeight: "bold" }}
              >
                {currencyFormatter(this.state.produk.harga, defaultOptions)}
              </Text>
             
            </View>
            <View style={{ alignItems: "center", marginTop: 20, }}>
            
            

              <FlatList
                data={this.state.produkmedia}
                extraData={this.state.refresh}
                style={{ flexGrow: 0, height: HEIGHT / 2 + 10, width: WIDTH, }}
                horizontal={true}
                renderItem={this._renderItem}
                keyExtractor={(item) =>
                  item.mediaid == null ? "" : item.mediaid.toString()

                }

                pagingEnabled={true}
              />
            </View>
            <View style={styles.inputContainer}>
              <View
                style={{
                  marginHorizontal: 20,
                  marginTop: 0,
                  marginBottom: 20,

                }}
              >

                <View >

                  <View flexDirection="row" style={{ padding: 5 }}>
                    <Text style={{ flex: 1, fontSize: 14, color: "#333333" }}>
                      Toko
                    </Text>
                    <TouchableOpacity style={{ flex: 3, }} onPress={this.OnToko}>
                      <Text style={{ fontSize: 16, color: "#F24E1E", fontWeight: 'bold' }}>
                        {this.state.produk.tokoname}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View flexDirection="row" style={{ padding: 5 }}>
                    <Text style={{ flex: 1, fontSize: 14, color: "#333333" }}>
                      Kategori
                    </Text>
                    <TouchableOpacity style={{ flex: 3, }} onPress={this.OnKategoriDetail}>
                      <Text style={{ fontSize: 16, color: "#F24E1E", fontWeight: 'bold' }}>
                        {this.state.produk.kategoriname}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View flexDirection="row" style={{ padding: 5 }}>
                    <Text style={{ flex: 1, fontSize: 14, color: "#333333" }}>
                      Stok
                    </Text>
                    <TouchableOpacity style={{ flex: 3, }}>
                      <Text style={{ fontSize: 16, color: "#F24E1E", fontWeight: 'bold' }}>
                        {this.state.produk.stok}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View flexDirection="row" style={{ padding: 5 }}>
                    <Text style={{ flex: 1, fontSize: 14, color: "#333333" }}>
                      Harga
                    </Text>
                    <TouchableOpacity style={{ flex: 3, }}>
                      <Text style={{ fontSize: 16, color: "#F24E1E", fontWeight: 'bold' }}>
                        {currencyFormatter(this.state.produk.harga, defaultOptions)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View flexDirection="row" style={{ padding: 5 }}>
                    <Text style={{ flex: 1, fontSize: 14, color: "#333333" }}>
                      Tanggal
                    </Text>
                    <TouchableOpacity style={{ flex: 3, }}>
                      <Text style={{ fontSize: 16, color: "#F24E1E", fontWeight: 'bold' }}>
                        {moment(this.state.produk.produkdate, "YYYYMMDD").fromNow()}

                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View flexDirection="row" style={{ padding: 5 }}>
                    <Text style={{ flex: 1, fontSize: 14, color: "#333333" }}>
                      Like
                    </Text>
                    <TouchableOpacity style={{ flex: 3, }}>
                      <Text style={{ fontSize: 16, color: "#F24E1E", fontWeight: 'bold' }}>
                        {this.state.produk.likecount}

                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View flexDirection="row" style={{ padding: 5 }}>
                <Text style={{ flex: 1, fontSize: 14, color: "#333333", textAlignVertical:'center' }}>
                  Chat
  </Text>
                <TouchableOpacity style={{ flex: 3, borderColor:"#F24E1E",borderWidth:1, borderRadius:10,padding:5}} onPress={async () =>{ this.OnChatDetail()} }>
                  <Text style={{ fontSize: 16, color: "#F24E1E", fontWeight: 'bold' }}>
                    Buka Chat
                  </Text>
                </TouchableOpacity>
              </View>

                </View>
                <View style={{ alignItems: "flex-start", marginTop: 20 }}>

                  <Text style={{ fontSize: 16, color: "black", marginBottom: 10 }}>
                    Deskripsi
                  </Text>

                </View>
                <View>
                  <Text style={{}}>{this.state.produk.deskripsi}</Text>
                </View>
                <View style={{ alignItems: "flex-start", marginTop: 20 }}>

                  <Text style={{ fontSize: 16, color: "black", marginBottom: 10 }}>
                    Fitur
</Text>

                </View>
                <View>
                  <Text style={{}}>{this.state.produk.fitur}</Text>
                </View>
                <View style={{ alignItems: "flex-start", marginTop: 20 }}>

                  <Text style={{ fontSize: 16, color: "black", marginBottom: 10 }}>
                    Spesifikasi
</Text>

                </View>
                <View style={{ backgroundColor: "white", borderRadius: 50 }}>
                  <Text >{this.state.produk.spesifikasi}</Text>
                </View>
                <View style={{ alignItems: "flex-start", marginTop: 20 }}>

                  <Text style={{ fontSize: 16, color: "black", marginBottom: 10 }}>
                    Ulasan ({(this.state.produk.reviewcount ?? 0)})
                  </Text>

                </View>


                {(this.state.produk.reviewcount ?? 0) == 0

                  ?
                  <TouchableOpacity
                    style={{
                      height: 45,
                      borderRadius: 10,
                      fontSize: 16,
                      borderColor: "#F24E1E",
                      borderWidth: 1,
                      justifyContent: "center",
                      flexDirection: "row",
                      backgroundColor: "white",

                      paddingHorizontal: 10,
                      marginHorizontal: 10,

                    }}
                    onPress={this.OnReview}
                  >


                    <Text
                      style={[styles.text, { textAlign: "center", color: "#F24E1E", marginTop: 10 }]}
                    >
                      Buat Ulasan
                   </Text>
                  </TouchableOpacity>
                  :
                  <View style={{ backgroundColor: "white", borderColor: "#F24E1E", borderWidth: 1, margin: 0, borderRadius: 30, padding: 20 }}>
                    <View style={{}}>
                      <AirbnbRating
                        count={5}
                        reviews={['1', '2', '3', '4', '5']}
                        showRating={true}
                        isDisabled={true}
                        defaultRating={this.state.produk.reviewavg}
                        size={20}
                      />
                      <TouchableOpacity
                        style={{
                          height: 45,
                          borderRadius: 10,
                          fontSize: 16,
                          borderColor: "#F24E1E",
                          borderWidth: 1,
                          justifyContent: "center",
                          flexDirection: "row",
                          backgroundColor: "white",
                          paddingHorizontal: 10,
                          marginHorizontal: 10,
                        }}
                        onPress={this.OnReview}
                      >
                        <Text style={[styles.text, { textAlign: "center", color: "#F24E1E", marginTop: 10 }]}>
                          Lihat Semua Ulasan
                         </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                }


              </View>

              <View style={{ marginBottom: 50, }}></View>

            </View>


          </ScrollView>
          <View
            style={{
              bottom: 0,
              alignItems: "center",
              justifyContent: "space-evenly",
              width: WIDTH,
              flexDirection: "row",
              position: "absolute",
              backgroundColor: "white",
              paddingBottom: 10,
              paddingTop: 5
            }}
          >
            <TouchableOpacity
              style={{
                height: 45,
                borderRadius: 10,
                fontSize: 16,
                borderColor: "#F24E1E",
                borderWidth: 1,
                justifyContent: "space-between",
                flexDirection: "row",
                backgroundColor: "white",

                paddingHorizontal: 10,

                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.8,
                shadowRadius: 2,
                elevation: 5,
              }}
              onPress={this.onLike}
            >
              {this.state.produklike.islike
                ?
                <Icon
                  name={"heart"}
                  size={25}
                  color={"#666872"}
                  style={{ color: "#F24E1E", marginTop: 10 }}
                />
                :
                <Icon
                  name={"heart-outline"}
                  size={25}
                  color={"#666872"}
                  style={{ color: "#F24E1E", marginTop: 10 }}
                />

              }

              <Text
                style={[styles.text, { color: "#F24E1E", marginTop: 10 }]}
              >
                Like
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                height: 45,
                borderRadius: 10,
                fontSize: 16,
                backgroundColor: "#F24E1E",
                justifyContent: "center",

                paddingHorizontal: 10,

                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.8,
                shadowRadius: 2,
                elevation: 5,

              }}
              onPress={this.onKeranjang}
            >
              {(this.state.keranjang != null && this.state.keranjang.stok >= 1 && this.state.keranjang.dlt == false && this.state.keranjang.produkid == this.state.produk.produkid)
                ?
                <Text style={styles.text}>Buka Keranjang</Text>
                :

                <Text style={styles.text}>Masukkan Ke Keranjang</Text>
              }


            </TouchableOpacity>
            <TouchableOpacity
              style={{
                height: 45,
                borderRadius: 10,
                fontSize: 16,
                borderColor: "#F24E1E",
                borderWidth: 1,
                justifyContent: "space-between",
                flexDirection: "row",
                backgroundColor: "white",

                paddingHorizontal: 10,

                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.8,
                shadowRadius: 2,
                elevation: 5,

              }}
              onPress={this.onShare}
            >
              <Icon
                name={"ios-share-social-outline"}
                size={25}
                color={"#666872"}
                style={{ color: "#F24E1E", marginTop: 10 }}
              />


            </TouchableOpacity>
          </View>

        </SafeAreaView>
      </View>
    );
  }
}

export default ProdukDetailScreen;

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
});
