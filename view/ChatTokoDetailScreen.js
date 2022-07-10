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
  ActivityIndicator,
} from "react-native";
import { Audio, Video } from "expo-av";
import ParsedText from "react-native-parsed-text";
import { GiftedChat, Bubble } from "react-native-gifted-chat";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Icon from "react-native-vector-icons/Ionicons";
import moment from "moment";
import * as firebase from "firebase";
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Rating, AirbnbRating } from "react-native-ratings";
import { createIconSetFromFontello } from "react-native-vector-icons";

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
var ref = null;

class ChatTokoDetailScreen extends React.Component {
  constructor() {
    super();

    this.state = {
      press: false,
      visibility: false,
      DateDisplay: "",
      TextInputDisableStatus: true,
      displayFormat: "YYYY-MM-DD",
      user: null,
      toko: null,
      messages: [],
      isLoading: false,
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
        harga: 0,
      },
      userchats: {
        key: 0,
        lastmessage: "....",
        name: "nama",
        tokoid: "",
        userid: "1",
      },
      chats: {
        key: 1,
        iswithtoko: false,
        userid1: 1,
        username1: "admin",
        tokoid: "",
        tokoname: "",
        userid2: 1,
        username2: "admin",
      },
      chatmessage: [
        {
          key: 1,
          dlt: false,
          message: "test pesan",
          messagedate: "2021-04-08 08:18:46",
          sentby: 1,
          sentname: "admin",
        },
      ],
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
        tokoname: "",
      },
      reviewavg: 0,
    };
  }

  refOn = (callback) => {
    ref = firebase.database().ref("chatmessages/" + this.state.userchats.key);

    ref
      .limitToLast(20)
      .on("child_added", (snapshot) => callback(this.parse(snapshot)));
  };

  parse = (snapshot) => {
    if (snapshot.key == "count") {
    } else {
      const {
        message: texts,
        dlt,
        messagedate: numberStamp,
        sentby,
        sentname,
        isimage,
        produkid,
        imageurl,
      } = snapshot.val();
      const { key: _id } = snapshot.key;
      const times = new Date(numberStamp);
      var users = {
        _id: sentby,
        name: sentname,
      };

      const message = {
        id: snapshot.key,
        _id: snapshot.key,
        createdAt: times,
        text: texts,
        user: users,
        isimage: isimage,
        produkid: produkid,
        imageurl: imageurl,
      };

      return message;
    }
  };
  get timestamp() {
    return firebase.database.ServerValue.TIMESTAMP;
  }

  onSend = async (messages) => {
    await this.setState({ isLoading: true });
    var userchatt = this.state.userchats;
    var tchats = this.state.chats;
    var tuser = this.state.user;
    var ttoko = this.state.toko;
    if (ttoko == null) ttoko = await getData("toko");
    if (tchats == null || tchats.userid1 == "") {
      tchats = {
        userid1: userchatt.userid,
        username1: userchatt.name,
        userid2: "",
        iswithtoko: true,
        tokoid: ttoko.tokoid,
        tokoname: ttoko.tokoname,
        username2: "",
      };

      await this.setState({ chats: tchats });
      tchats.key = await firebase
        .database()
        .ref("chats/")
        .push(tchats)
        .getKey();
    }
    

    for (let i = 0; i < messages.length; i++) {
      const { text, user, createdAt } = messages[i];
      userchatt.lastmessage = text;

      const messagesed = {
        dlt: false,
        message: text,
        sentby: tuser.userid,
        sentname: tuser.nama,
        messagedate: this.timestamp,
        isimage: false,
        imageurl: "",
        produkid: "",
      };
      if (
        messages[i].produkid !== undefined &&
        messages[i].produkid != null &&
        messages[i].produkid != ""
      ) {
        messagesed = {
          dlt: false,
          message: text,
          sentby: tuser.userid,
          sentname: tuser.nama,
          messagedate: this.timestamp,
          produkid: messages[i].produkid,
          imageurl: messages[i].imageurl,
          isimage: true,
        };
      }
      await firebase
        .database()
        .ref("chatmessages/" + userchatt.key)
        .push(messagesed);
    }

    await firebase
      .database()
      .ref("userchats/" + tchats.userid1 + "/" + userchatt.key)
      .set(userchatt);

    userchatt.tokoid = "";
    userchatt.name = tchats.username1;
    userchatt.userid = tchats.userid1;

    await firebase
      .database()
      .ref("tokochats/" + tchats.tokoid + "/" + userchatt.key)
      .set(userchatt);

    userchatt.tokoid = tchats.tokoid;
    userchatt.name = tchats.tokoname;
    userchatt.userid = "";
    await firebase
      .database()
      .ref("userchats/" + tchats.userid1 + "/" + userchatt.key)
      .set(userchatt);

    this.setState({ chats: tchats, userchats: userchatt, isLoading: false });
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

  LoadChatFirst = async () => {
    const { navigation, route } = this.props;
    const { params: selectedproduk } = route.params;

    var tuser = this.state.user;
    if (tuser == null) tuser = await getData("user");
    // load message
    this.setState({ userchats: selectedproduk, user: tuser });
    try {
      
      await firebase
        .database()
        .ref("produklike/" + selectedproduk.produkid + "/" + tuser.userid)
        .on("value", (snapshot) => {
          
          
          
          if (snapshot != null && snapshot.val() != null) {
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
          if (snapshot != null && snapshot.val() != null) {
            tkeranjang = {
              key: snapshot.key,
              dlt: snapshot.val().dlt ?? false,
              produkid: snapshot.val().produkid ?? selectedproduk.produkid,
              userid: snapshot.val().userid ?? tuser.userid,
              mediaurl: firstmedia,
              produkname: selectedproduk.produkname,
              stok: snapshot.val().stok ?? 0,
              harga: selectedproduk.harga,
            };

            this.setState({ keranjang: tkeranjang });
          }
        });
    } catch (error) {
      //console.error(error);
    }

    this.setState({ user: tuser, produklike: tproduklike });
    //storeData("produk", tempproduk);
  };

  OnToko = () => {
    const { navigation } = this.props;
    navigation.push("Toko", { params: this.state.produk.tokoid });
  };

  _renderItem = ({ item }) => {
    return (
      <TouchableOpacity onPress={async (xitem) => {}}>
        <Image
          source={{ uri: item.mediaurl }}
          style={{
            height: HEIGHT / 2 - 20,
            width: WIDTH - 30,
            marginHorizontal: 10,
            borderWidth: 0,
            borderRadius: 10,
          }}
          resizeMode="contain"
        />
      </TouchableOpacity>
    );
  };
  renderBubble = (props) => {
    let colors = this.getColor(props.currentMessage.user.name);
    
    if (props.currentMessage.isimage) {
      
      return (
        <TouchableOpacity
          onPress={() => this.OnProdukDetail(props.currentMessage.produkid)}
          style={{ width: WIDTH - 20 }}
        >
          <Image
            source={{ uri: props.currentMessage.imageurl }}
            style={{
              height: HEIGHT / 3,
              width: WIDTH / 2,
              marginHorizontal: 100,
              borderWidth: 0,
              borderRadius: 20,
            }}
            resizeMode="contain"
          />
          <Bubble
            {...props}
            textStyle={{
              right: {
                color: "white",
              },
            }}
            wrapperStyle={{
              left: {
                backgroundColor: colors,
              },
            }}
          />
        </TouchableOpacity>
      );
    } else {
      return (
        <Bubble
          {...props}
          textStyle={{
            right: {
              color: "white",
            },
          }}
          wrapperStyle={{
            left: {
              backgroundColor: colors,
            },
          }}
        />
      );
    }
  };

  getColor(username) {
    let sumChars = 0;
    for (let i = 0; i < username.length; i++) {
      sumChars += username.charCodeAt(i);
    }

    const colors = [
      "#FCECDD", // carrot
      "#FFC288", // emerald
      "#FDBAF8", // peter river
      "#B0EFEB", // wisteria
      "#EDFFA9", // alizarin
      "#98DDCA", // turquoise
      "#DEEDF0", // midnight blue
      "#B6C9F0", // midnight blue
      "#F6DFEB", // midnight blue
      "#C7FFD8", // midnight blue
      "#C7FFD8", // midnight blue
    ];
    return colors[sumChars % colors.length];
  }
  OnProdukDetail = (produkid) => {
    const { navigation } = this.props;
    firebase
      .database()
      .ref("produk/" + produkid)
      .on("value", (snapshot) => {
        navigation.push("ProdukDetail", { params: snapshot.val() });
      });
  };

  async componentDidMount() {
    // var tsuer = await getData("user");
    // this.setState({ user: tsuer });
    // await this.getProduk();
    await this.setState({ isLoading: true });
    const { navigation, route } = this.props;
    const { params: selectedproduk } = route.params;

    var tuser = this.state.user;
    if (tuser == null) tuser = await getData("user");
    var ttoko = this.state.toko;
    if (ttoko == null) ttoko = await getData("toko");

    if (ttoko == null) await new Promise((r) => setTimeout(r, 1000));
    if (ttoko == null) await new Promise((r) => setTimeout(r, 1000));

    
    // userchat
    await this.setState({
      userchats: selectedproduk,
      user: tuser,
      toko: ttoko,
    });

    
    //chats
    var tchats = null;
    try {
      
      await firebase
        .database()
        .ref("chats/" + selectedproduk.key)
        .on("value", (snapshot) => {
          if (snapshot != null && snapshot.val() != null) {
            tchats = {
              key: snapshot.key,
              iswithtoko: snapshot.val().iswithtoko ?? false,
              tokoid: snapshot.val().tokoid ?? "",
              tokoname: snapshot.val().tokoname ?? "",
              userid1: snapshot.val().userid1 ?? "",
              userid2: snapshot.val().userid2 ?? "",
              username1: snapshot.val().username1 ?? "",
              username2: snapshot.val().username2 ?? "",
            };

            this.setState({ chats: tchats });
          }
        });
    } catch (error) {
      //console.error(error);
    }

    if (this.state.tchats == null)
      await new Promise((r) => setTimeout(r, 1000));
    if (this.state.tchats == null)
      await new Promise((r) => setTimeout(r, 1000));
    if (this.state.tchats == null)
      await new Promise((r) => setTimeout(r, 1000));
    if (this.state.tchats == null)
      await new Promise((r) => setTimeout(r, 1000));

    // load messege
    this.refOn((message) =>
      this.setState((previousState) => ({
        messages: GiftedChat.append(previousState.messages, message),
      }))
    );
    await new Promise((r) => setTimeout(r, 1000));
    await this.setState({ isLoading: false });
    if (selectedproduk.produk !== undefined && selectedproduk.produk != null) {
      // get first image
      
      var message = [
        {
          text: selectedproduk.produk.produkname,
          produkid: selectedproduk.produk.produkid,
          imageurl: selectedproduk.produk.firstmedia,
        },
      ];
      selectedproduk.produk = null;
      
      await this.onSend(message);
    }
  }

  componentWillUnmount() {
    if (ref != null) ref.off();
  }

  render() {
    return (
      <View style={styles.container}>
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
              <Icon name={"chevron-back-outline"} size={25} color={"#666872"} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={{ padding: 10, paddingTop: 20 }}
            onPress={() => {
              
              const { navigation } = this.props;
              if (this.state.tchats != null) {
                if (
                  this.state.tchats.iswithtoko == true &&
                  this.state.userchats.name == this.state.tchats.tokoname
                ) {
                  navigation.push("Toko", { params: this.state.produk.tokoid });
                } else {
                }
              }
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              {this.state.userchats.name}
            </Text>
          </TouchableOpacity>
          <View style={{ marginTop: 20 }}>
            <Icon name={"cart"} size={25} color={"white"} />
          </View>
        </View>
        <ActivityIndicator
          size="large"
          color="#F24E1E"
          animating={this.state.isLoading}
          style={{
            position: "absolute",
            top: HEIGHT / 2,
            left: (WIDTH / 2) - 20,
          }}
        />

        <GiftedChat
          messages={this.state.messages}
          onSend={ async (messages) => await this.onSend(messages)}
          alwaysShowSend={true}
          showUserAvatar={true}
          renderBubble={this.renderBubble}
          user={{
            _id: this.state.toko == null ? "" : this.state.toko.tokoid,
            name: this.state.toko == null ? "" : this.state.toko.tokoname,
            id: this.state.toko == null ? "" : this.state.toko.tokoid,
          }}
        />
      </View>
    );
  }
}

export default ChatTokoDetailScreen;

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
  video: {
    width: 200,
    height: 200,
  },
});
