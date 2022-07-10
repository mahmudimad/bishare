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
  KeyboardAvoidingView

} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Icon from "react-native-vector-icons/Ionicons";
import moment from "moment";
import * as firebase from "firebase";
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Picker } from '@react-native-community/picker';

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

class ChangePasswordScreen extends React.Component {
  constructor() {
    super();

    this.state = {
      press: false,
      visibility: false,
      DateDisplay: "",
      TextInputDisableStatus: true,
      displayFormat: "YYYY-MM-DD",

      kategori: [],
      produklike: {
        key: 0,
        islike: false,
        userid: "",
      },
      showOldPass: true,
      showNewPass: true,
      showConfirmPass: true,
      oldpPass: "",
      newPass: "",
      confirmpPass: "",
      firstmedia: "",
      keranjanglist: [],
      user: {
        key: 0,
        dlt: true,
        userid: "",
        nama: "----",
        username: "",
        tanggallahir: Date.now(),
        alamat: "",
        jeniskelamin: "m",
        nohp: "m",
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

  handleConfirmTglLahir = (date) => {
    this.setState({ tanggallahir: date })
    this.setState({ visibility: false })
    this.setState({ TextInputDisableStatus: true })

  }
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
  OnSimpan = async () => {
    const { navigation } = this.props;
    var tuser = this.state.user;
    var tOldPass = this.state.oldpPass;
    var tNewPass = this.state.newPass;
    var tConfirmPass = this.state.confirmpPass;
    if (tOldPass == "" || tOldPass == null) {
      ToastAndroid.show("Password Lama Kosong", ToastAndroid.SHORT);
      return;
    }
    if (tNewPass == "" || tNewPass == null) {
      ToastAndroid.show("Password Baru Kosong", ToastAndroid.SHORT);
      return;
    }
    if (tConfirmPass == "" || tConfirmPass == null) {
      ToastAndroid.show("Password Konfrimasi Kosong", ToastAndroid.SHORT);
      return;
    }

    if (tuser.password != tOldPass) {
      ToastAndroid.show("Password lama tidak sama", ToastAndroid.SHORT);
      return;
    }
    if (tNewPass != tConfirmPass) {
      ToastAndroid.show("Password Baru tidak sama", ToastAndroid.SHORT);
      return;
    }
    if (tOldPass == tNewPass) {
      ToastAndroid.show("Password baru sama dengan password lama", ToastAndroid.SHORT);
      return;
    }
    tuser.password = tNewPass;
    
    Alert.alert(
      "Ganti Password",
      "Apakah anda yakin untuk menyimpan data?",

      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK", onPress: async () => {

            await firebase
              .database()
              .ref("users/" + tuser.userid)
              .set(tuser);
            await storeData("user", tuser);

            await new Promise(r => setTimeout(r, 1000));
            ToastAndroid.show("Password berhasil Disimpan", ToastAndroid.SHORT);
          }
        }
      ]
    );


  };


  handleConfirm = (date) => {
    this.setState({ DateDisplay: date });
    this.setState({ visibility: false });
    this.setState({ TextInputDisableStatus: true });
  };


  showOldPass = async () => {
    if (this.state.showOldPass != false) {
      this.setState({ showOldPass: false });
    } else {
      this.setState({ showOldPass: true });
    }
  };
  showNewPass = async () => {
    
    if (this.state.showNewPass != false) {
      this.setState({ showNewPass: false });
    } else {
      this.setState({ showNewPass: true});
    }
  };
  showConfirmPass = async () => {
    if (this.state.showConfirmPass != false) {
      this.setState({ showConfirmPass: false});
    } else {
      this.setState({ showConfirmPass: true });
    }
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
              navigation.push("RegisterTab");
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
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 20 }}>Change Password</Text>
            <View style={{ marginTop: 20 }}>
              <Icon name={"cart"} size={25} color={"white"} />
            </View>
          </View>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : null}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}>
            <ScrollView style={{ height: HEIGHT }}>
              <View style={{ marginTop: 10, marginHorizontal: 0, width: WIDTH,  paddingBottom: 5, borderRadius: 10, backgroundColor: "white", }}>


                <View style={{ justifyContent: "center", paddingHorizontal: 20, paddingVertical: 10 }}>

                  <Text style={{ color: "black", fontSize: 16, fontWeight: "bold" }}>Data User</Text>
                </View>

                <View style={{ marginHorizontal: 20, marginTop: 10 }}>
                  <Text style={{ fontSize: 16, marginTop: 5 }}>Password Lama</Text>
                  <View>
                    <TextInput
                      style={{ fontSize: 16, height: 40 }}
                      placeholder={"Masukkan Password Lama"}
                      onChangeText={async (val) => {
                        await this.setState({ oldpPass: val })
                      }}
                      autoCapitalize={"none"}
                      placeholderTextColor={"#666872"}
                      underlineColorAndroid="transparent"
                      maxLength={35}
                      autoFocus={true}
                      secureTextEntry={this.state.showOldPass}
                      textContentType={"password"}
                      autoCompleteType={"password"}
                    />
                    <TouchableOpacity style={styles.btnEye} onPress={this.showOldPass}>
                      <Icon name={
                        this.state.showOldPass != false
                          ? "ios-eye-outline"
                          : "ios-eye-off-outline"
                      }
                        size={25}
                        color={"#666872"}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={{ borderWidth: 1, borderColor: "#F3F3F3", width: WIDTH - 40 }}></View>

                  <Text style={{ fontSize: 16, marginTop: 5 }}>Password Baru</Text>
                  <View>
                    <TextInput
                      style={{ fontSize: 16, height: 40 }}
                      placeholder={"Masukkan Password Baru"}
                      onChangeText={async (val) => {
                        await this.setState({ newPass: val })
                      }}
                      autoCapitalize={"none"}
                      placeholderTextColor={"#666872"}
                      underlineColorAndroid="transparent"
                      maxLength={35}
                      multiline={false}
                      
                      secureTextEntry={this.state.showNewPass}
                      textContentType={"password"}
                      autoCompleteType={"password"}
                    />
                    <TouchableOpacity style={styles.btnEye} onPress={this.showNewPass}>
                      <Icon name={
                         this.state.showNewPass != false
                          ? "ios-eye-outline"
                          : "ios-eye-off-outline"
                      }
                        size={25}
                        color={"#666872"}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={{ borderWidth: 1, borderColor: "#F3F3F3", width: WIDTH - 40 }}></View>

                  <Text style={{ fontSize: 16, marginTop: 5 }}>Konfimrasi Password</Text>
                  <View>
                    <TextInput
                      style={{ fontSize: 16, height: 40 }}
                      placeholder={"Masukkan Password Baru"}
                      onChangeText={async (val) => {
                        await this.setState({ confirmpPass: val })
                      }}
                      autoCapitalize={"none"}
                      placeholderTextColor={"#666872"}
                      underlineColorAndroid="transparent"
                      maxLength={35}                      
                      secureTextEntry={this.state.showConfirmPass}
                      textContentType={"password"}
                      autoCompleteType={"password"}
                    />
                    <TouchableOpacity style={styles.btnEye} onPress={this.showConfirmPass.bind(this)}>
                      <Icon name={
                         this.state.showConfirmPass != false
                          ? "ios-eye-outline"
                          : "ios-eye-off-outline"
                      }
                        size={25}
                        color={"#666872"}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={{ borderWidth: 1, borderColor: "#F3F3F3", width: WIDTH - 40 }}></View>


                </View>

              </View>
            </ScrollView>
          </KeyboardAvoidingView>
          <View style={{}}>


          </View>

        </SafeAreaView>
        <TouchableOpacity style={{ position: "absolute", bottom: 0, padding: 15, flexDirection: 'row', borderColor: "#F24E1E", borderWidth: 1, marginBottom: -1, alignContent: "space-between", width: WIDTH, backgroundColor: "white", borderTopRightRadius: 15, borderTopLeftRadius: 15, paddingBottom: 20 }} onPress={this.OnSimpan}>


          <Text style={{ fontSize: 14, fontWeight: "bold", flex: 1, textAlign: "center", color: "#F24E1E" }}>Ganti Password</Text>


        </TouchableOpacity>
      </View>
    );
  }
}

export default ChangePasswordScreen;

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
    right: 20,
  },
});
