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
  Clipboard,
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

class DiskusiDetailScreen extends React.Component {
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
      isLoading: false,
      messages: [],

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
        diskusiid: "....",
        diskusiname: "nama",
        diskusidesc: "",
        diskusitype: "1",
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

    if (tuser == null) tuser = await getData("user");

    

    for (let i = 0; i < messages.length; i++) {
      const { text, user, createdAt } = messages[i];

      const messagesed = {
        dlt: false,
        message: text,
        sentby: tuser.userid,
        sentname: tuser.nama,
        messagedate: this.timestamp,
      };
      
      await firebase
        .database()
        .ref("chatmessages/" + userchatt.diskusiid)
        .push(messagesed);
    }

    await this.setState({ userchats: userchatt, isLoading: false });
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

  onLongPress(context, message) {
    
    var options = [];
    options = ["copy", "Cancel"];

    const cancelButtonIndex = options.length - 1;
    context.actionSheet().showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            Clipboard.setString(message.text);
            break;
        }
      }
    );
  }
  renderBubble = (props) => {
    let colors = this.getColor(props.currentMessage.user.name);

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

  async componentDidMount() {
    // var tsuer = await getData("user");
    // this.setState({ user: tsuer });
    // await this.getProduk();
    await this.setState({ isLoading: true });
    const { navigation, route } = this.props;
    const { params: selectedproduk } = route.params;

    var tuser = this.state.user;
    if (tuser == null) tuser = await getData("user");

    if (tuser == null) await new Promise((r) => setTimeout(r, 1000));
    if (tuser == null) await new Promise((r) => setTimeout(r, 1000));

    
    // userchat
    await this.setState({ userchats: selectedproduk, user: tuser });

    

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
              if (this.state.chats != null) {
                if (this.state.chats.iswithtoko == true) {
                  navigation.push("Toko", { params: this.state.chats.tokoid });
                } else {
                }
              }
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              {this.state.userchats.diskusiname}
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
            left: WIDTH / 2 - 20,
          }}
        />
        <GiftedChat
          messages={this.state.messages}
          onSend={async (messages) => await this.onSend(messages)}
          alwaysShowSend={true}
          showUserAvatar={true}
          onLongPress={this.onLongPress}
          renderBubble={this.renderBubble}
          user={{
            _id: this.state.user == null ? "" : this.state.user.userid,
            name: this.state.user == null ? "" : this.state.user.nama,
            id: this.state.user == null ? "" : this.state.user.userid,
          }}
        />
      </View>
    );
  }
}

export default DiskusiDetailScreen;

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
