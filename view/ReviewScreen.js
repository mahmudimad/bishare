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
  return `${currency.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    options.thousandsSeparator
  )}`;
};

class ReviewScreen extends React.Component {
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
      produk: null,
      candelete: false,
      firstmedia: "",
      reviewlist: [],
      review: {
        key: 0,
        dlt: false,
        produkid: "",
        userid: "",
        username: "",
        reviewtotal: 0,
        reviewdesc: "",
        reviewdate: Date.now(),
      },
      oldreview: {
        key: 0,
        dlt: false,
        produkid: "",
        userid: "",
        username: "",
        reviewtotal: 0,
        reviewdesc: "",
        reviewdate: Date.now(),
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

  onReview = async () => {
    
    this.setState({ isFetching: true })
    var tproduk = this.state.produk;
    var tuser = this.state.user;
    if (tuser == null)
      tuser = await getData("user");

    var treview = this.state.review;
    var toldreview = this.state.oldreview;
    if (treview.reviewtotal <= 0) {
      this.notify("Ulasan kosong");
      return;
    }
    if (toldreview.reviewtotal >= 1) {
      tproduk.reviewtotal = tproduk.reviewtotal - toldreview.reviewtotal;
      tproduk.reviewcount = tproduk.reviewcount - 1;
    }
    if (tproduk.reviewtotal < 0)
      treview.reviewtotal = 0;
    if (tproduk.reviewcount < 0)
      treview.reviewcount = 0;

    treview.reviewdate = Date.now();
    treview.userid = tuser.userid;
    treview.username = tuser.nama;
    treview.produkid = tproduk.produkid;
    

    tproduk.reviewtotal = tproduk.reviewtotal + treview.reviewtotal;
    tproduk.reviewcount = tproduk.reviewcount + 1;
    tproduk.reviewavg = tproduk.reviewtotal / tproduk.reviewcount;
    this.setState({ review: treview, oldreview: treview, produk: tproduk, refresh: !this.state.refresh, isFetching: false });
    await firebase
      .database()
      .ref("review/" + tproduk.produkid + "/" + tuser.userid)
      .set(treview);

    await firebase
      .database()
      .ref("produk/" + tproduk.produkid)
      .set(tproduk);

    await this.LoadReview();
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



  handleConfirm = (date) => {
    this.setState({ DateDisplay: date });
    this.setState({ visibility: false });
    this.setState({ TextInputDisableStatus: true });
  };

  onDeleteReview = async (item) => {
    this.setState({ isFetching: true })

    
    var tproduk = this.state.produk;
    if(tproduk == null)
    return;
    item.dlt = true;
    firebase
      .database()
      .ref("review/" + item.produkid + "/" + item.userid)
      .set(item);

    
    tproduk.reviewtotal = tproduk.reviewtotal - item.reviewtotal;
    tproduk.reviewcount = tproduk.reviewcount - 1;
    tproduk.reviewavg = tproduk.reviewtotal / tproduk.reviewcount;
    await firebase
      .database()
      .ref("produk/" + tproduk.produkid)
      .set(tproduk);
    await this.LoadReview();
  }

  LoadReview = async () => {
    
    const { navigation, route } = this.props;
    const { params: selectedproduk } = route.params;
    this.setState({ isFetching: true });

    var tuser = this.state.user;
    if (tuser == null) {
      tuser = await getData("user");
    }
    if (tuser == null)
      await new Promise(r => setTimeout(r, 1000));

    
    // 
    var treviewlist = [];
    var ttotalproduk = 0;
    var ttotalharga = 0;
    var treview = {
      key: 0,
      dlt: false,
      produkid: "",
      userid: "",
      username: "",
      reviewtotal: "",
      reviewdesc: "",
      reviewdate: Date.now(),
    };
    var toldreview = {
      key: 0,
      dlt: false,
      produkid: "",
      userid: "",
      username: "",
      reviewtotal: "",
      reviewdesc: "",
      reviewdate: Date.now(),
    };
    try {
      await firebase
        .database()
        .ref("review/" + selectedproduk.produkid + "/")
        .on("value", (snapshot) => {
          
          treview = {
            key: 0,
            dlt: false,
            produkid: "",
            userid: "",
            username: "",
            reviewtotal: "",
            reviewdesc: "",
            reviewdate: Date.now(),
          };
          toldreview = {
            key: 0,
            dlt: false,
            produkid: "",
            userid: "",
            username: "",
            reviewtotal: "",
            reviewdesc: "",
            reviewdate: Date.now(),
          };
          treviewlist = []
          snapshot.forEach((child) => {
            if (
              child.key != "count" &&
              child.key != "produkmediacount" &&
              child.val().dlt != true
            ) {
              if (child.val().userid == tuser.userid) {
                treview = {
                  key: child.key,
                  dlt: child.val().dlt,
                  produkid: child.val().produkid,
                  userid: child.val().userid,
                  username: child.val().username,
                  reviewtotal: child.val().reviewtotal,
                  reviewdesc: child.val().reviewdesc,
                  reviewdate: child.val().reviewdate,
                };
                toldreview = {
                  key: child.key,
                  dlt: child.val().dlt,
                  produkid: child.val().produkid,
                  userid: child.val().userid,
                  username: child.val().username,
                  reviewtotal: child.val().reviewtotal,
                  reviewdesc: child.val().reviewdesc,
                  reviewdate: child.val().reviewdate,
                };
              }
              treviewlist.push({
                key: child.key,
                dlt: child.val().dlt,
                produkid: child.val().produkid,
                userid: child.val().userid,
                username: child.val().username,
                reviewtotal: child.val().reviewtotal,
                reviewdesc: child.val().reviewdesc,
                reviewdate: child.val().reviewdate,
              });
            }
          });

          
          this.setState({ reviewlist: treviewlist, });
          storeData("reviewlist", treviewlist);
          //
        });
      var tcandelete = false;
      
      

      if (tuser.tokoid == selectedproduk.tokoid) {
        tcandelete = true;
      }
      if (tuser.status == "admin") { tcandelete = true; }

      await this.setState({ candelete: tcandelete, produk: selectedproduk, oldreview: toldreview, reviewlist: treviewlist, review: treview, isFetching: false, user: tuser });
    } catch (error) {
      console.error(error);
    }
    await this.setState({ isFetching: false })

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
    var ismy = this.state.user.userid == item.userid;

    return (
      <View style={{ backgroundColor: "white", marginHorizontal: 20, marginTop: 10, padding: 15, borderRadius: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
          <Text style={{ fontWeight: "bold" }}>{item.username}</Text>
          <Text style={{ color: "#7F7F7F" }}> {moment(item.reviewdate).fromNow()}</Text>
        </View>
        <AirbnbRating
          count={5}
          reviews={['1', '2', '3', '4', '5']}
          showRating={false}
          isDisabled={true}
          defaultRating={item.reviewtotal}
          size={20}

          style={{ backgroundColor: "black" }}
        />
        <Text>{item.reviewdesc}</Text>


        { this.state.candelete || ismy && (

          <TouchableOpacity onPress={async () => { this.onDeleteReview(item) }}>
            <Icon name={"trash-outline"} style={{ alignSelf: "flex-end" }} size={25} color={"red"} />
          </TouchableOpacity>
        )
        }



      </View>
    );
  };


  async componentDidMount() {
    var tsuer = await getData("user");
    this.setState({ user: tsuer });
    await this.LoadReview();
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
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 20 }}>Daftar Ulasan</Text>
            <View style={{ marginTop: 20 }}>
              <Icon name={"cart"} size={25} color={"white"} />
            </View>
          </View>


          <View style={{}}>
            <View style={{ backgroundColor: "white", marginHorizontal: 20, marginTop: 10, padding: 15, borderRadius: 10 }}>
              <Text style={{ marginBottom: 10, fontWeight: "bold" }}>Buat Ulasan</Text>
              <AirbnbRating
                count={5}
                reviews={['1', '2', '3', '4', '5']}
                showRating={false}
                isDisabled={false}
                onFinishRating={(val) => {
                  var treview = this.state.review;
                  treview.reviewtotal = val;
                  this.setState({ review: treview })
                }}
                defaultRating={this.state.review.reviewtotal}
                size={20}
              />

              <TextInput
                style={{ height: 60, marginVertical: 10, backgroundColor: "#fafafa", borderRadius: 10, padding: 4 }}
                placeholder={"Jelaskan produk"}
                onChangeText={(val) => {
                  var treview = this.state.review;
                  treview.reviewdesc = val;
                  this.setState({ review: treview })
                }}
                value={this.state.review.reviewdesc}
                textAlignVertical={"top"}
                multiline={true}
                placeholderTextColor={"#666872"}
                underlineColorAndroid="transparent"

              />
              <TouchableOpacity
                style={{

                  borderRadius: 10,
                  fontSize: 16,
                  backgroundColor: "#F24E1E",

                  justifyContent: "center",
                  flexDirection: "row",
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  marginHorizontal: 0,

                }}
                onPress={this.onReview}
              >


                <Text
                  style={[styles.text, { textAlign: "center", color: "white" }]}
                >
                  Simpan Ulasan
                   </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={this.state.reviewlist}
              extraData={this.state.refresh}
              style={{
                paddingHorizontal: 0,
                backgroundColor: "#F6F6F6",
                height: HEIGHT - 80
              }}


              contentContainerStyle={{ justifyContent: "space-between" }}
              renderItem={this._renderProduk}
              keyExtractor={(item) => item.userid.toString()}
              onRefresh={() => this.LoadReview()}
              refreshing={this.state.isFetching}
            />

          </View>

        </SafeAreaView>
        <View style={{ position: "absolute", bottom: 0, padding: 15, flexDirection: 'row', alignContent: "space-between", width: WIDTH, backgroundColor: "white", borderTopRightRadius: 15, borderTopLeftRadius: 15, paddingBottom: 20 }}>
          <Text style={{ flex: 1, textAlign: "left" }}>{this.state.produk != null ? this.state.produk.reviewcount ?? 0 : 0} Ulasan</Text>
          <Text style={{ fontSize: 14, fontWeight: "bold", flex: 1, textAlign: "right" }}>{currencyFormatter(this.state.produk != null ? this.state.produk.reviewavg ?? 0 : 0)} ⭐</Text>
        </View>
      </View>
    );
  }
}

export default ReviewScreen;

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
