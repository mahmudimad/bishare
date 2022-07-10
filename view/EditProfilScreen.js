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

class EditProfilScreen extends React.Component {
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
      showPass: true,
      firstmedia: "",
      keranjanglist: [],
      user: {
        key: 0,
        dlt: true,
        userid: "",
        nama: "----",
        username: "",
        tanggallahir: '',
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
   
      var tuser = this.state.user;
      tuser.tanggallahir = formatDate(date) ;
       this.setState({ user: tuser })   
   
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
    if (tuser.nama == "" || tuser.nama == null) {
      ToastAndroid.show("Nama Kosong", ToastAndroid.SHORT);
      return;
    }
    if (tuser.username == "" || tuser.username == null) {
      ToastAndroid.show("Username Kosong", ToastAndroid.SHORT);
      return;
    }
    if (tuser.jeniskelamin == "" || tuser.jeniskelamin == null) {
      ToastAndroid.show("Jenis Kelamin Kosong", ToastAndroid.SHORT);
      return;
    }
    if (tuser.tanggallahir == "" || tuser.tanggallahir == null) {
      ToastAndroid.show("Tanggal Lahir Kosong", ToastAndroid.SHORT);
      return;
    }
    
    Alert.alert(
      "Simpan",
      "Data diri seperti nama yang sudah tercatat di review dan lainnya tidak akan berubah\n\nApakah anda yakin untuk menyimpan data?",

      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK", onPress: async () => {
            try {
              var res=   await firebase
              .database()
              .ref("users/" + tuser.userid )
              .set(tuser);
              
            await storeData("user",tuser);           
            await new Promise(r => setTimeout(r, 1000));
            } catch (error) {
              console.error(error);
            }
            
      
            ToastAndroid.show("Data Berhasil Disimpan", ToastAndroid.SHORT);
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
    if(tsuer == null)
    await new Promise(r => setTimeout(r, 1000));
    if(tsuer == null)
    await new Promise(r => setTimeout(r, 1000));
    if(tsuer == null)
    await new Promise(r => setTimeout(r, 1000));
    
    await firebase
        .database()
        .ref("users/" + tsuer.userid)
        .on("value", (snapshot) => {
          if (snapshot != null && snapshot.val() != null
          ) {
            tsuer = snapshot.val();
            tsuer.key = snapshot.key;

            this.setState({ user: tsuer });
            storeData("user",tsuer);
            
          }
        });
    
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
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 20 }}>Edit Profil</Text>
            <View style={{ marginTop: 20 }}>
              <Icon name={"cart"} size={25} color={"white"} />
            </View>
          </View>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : null}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}>
            <ScrollView style={{ height: HEIGHT }}>
              <View style={{ marginTop: 10, marginHorizontal: 0, width: WIDTH, height: HEIGHT + 150, paddingBottom: 5, borderRadius: 10, backgroundColor: "white", }}>


                <View style={{ justifyContent: "center", paddingHorizontal: 20, paddingVertical: 10 }}>

                  <Text style={{ color: "black", fontSize: 16, fontWeight: "bold" }}>Data User</Text>
                </View>

                <View style={{ marginHorizontal: 20, marginTop: 10 }}>
                  <Text style={{ fontSize: 16, marginTop: 5 }}>Nama</Text>
                  <TextInput
                    style={{ fontSize: 16 }}
                    placeholder={"Masukkan nama"}
                    onChangeText={async (val) => {
                      var tuser = this.state.user;
                      tuser.nama = val;
                      await this.setState({ user: tuser })
                    }}
                    autoCapitalize={"words"}
                    placeholderTextColor={"#666872"}
                    underlineColorAndroid="transparent"
                    maxLength={35}
                    defaultValue={this.state.user.nama}
                    textContentType={"name"}
                  />
                  <View style={{ borderWidth: 1, borderColor: "#F3F3F3", width: WIDTH - 40 }}></View>

                  <Text style={{ fontSize: 16, marginTop: 5 }}>Username</Text>
                  <TextInput
                    style={{ fontSize: 16 }}
                    placeholder={"Masukkan Username"}
                    onChangeText={async (val) => {
                      var tuser = this.state.user;
                      tuser.username = val;
                      await this.setState({ user: tuser })
                    }}
                    defaultValue={this.state.user.username}
                    placeholderTextColor={"#666872"}
                    underlineColorAndroid="transparent"
                    maxLength={35}
                    textContentType={"username"}
                    autoCompleteType={"username"}
                  />
                  <View style={{ borderWidth: 1, borderColor: "#F3F3F3", width: WIDTH - 40 }}></View>

                  <Text style={{ fontSize: 16, marginTop: 5 }}>No HP</Text>
                  <TextInput
                    style={{ fontSize: 16 }}
                    placeholder={"Masukkan No HP"}
                    onChangeText={async (val) => {
                      var tuser = this.state.user;
                      tuser.nohp = val;
                      await this.setState({ user: tuser })
                    }}
                    defaultValue={this.state.user.nohp}
                    placeholderTextColor={"#666872"}
                    underlineColorAndroid="transparent"
                    maxLength={35}
                    keyboardType={"phone-pad"}
                    textContentType={"telephoneNumber"}
                    autoCompleteType={"tel"}
                  />
                  <View style={{ borderWidth: 1, borderColor: "#F3F3F3", width: WIDTH - 40 }}></View>

                  <Text style={{ fontSize: 16, marginTop: 5 }}>Jenis Kelamin</Text>
                  <Picker
                    selectedValue={this.state.user.jeniskelamin}
                    style={{ height: 50, width: WIDTH - 50 }}
                    onValueChange={async (val) => {
                      var tuser = this.state.user;
                      tuser.jeniskelamin = val;
                      await this.setState({ user: tuser })
                    }}
                  >
                    <Picker.Item label="Please select an option..." value="" />
                    <Picker.Item label="Laki-Laki" value="m" />
                    <Picker.Item label="Perempuan" value="f" />
                    
                  </Picker>

                  <View style={{ borderWidth: 1, borderColor: "#F3F3F3", width: WIDTH - 40 }}></View>
                  <Text style={{ fontSize: 16, marginTop: 5 }}>Tanggal Lahir</Text>
                  <TextInput
                    style={{ fontSize: 16 }}
                    placeholder={'Tanggal Lahir Kamu'}
                    placeholderTextColor={'#666872'}
                    underlineColorAndroid='transparent'
                    // pointerEvents="none"
                    editable={this.state.TextInputDisableStatus}
                   
                    pointerEvents="none"
                    selectTextOnFocus={false}
                    onTouchStart={this.onPressButton}
                    value={ moment( this.state.user.tanggallahir).format(this.state.displayFormat) }
                  />
                  <DateTimePickerModal
                    mode="date"
                    value={Date.parse( this.state.user.tanggallahir)}
                  
                    isVisible={this.state.visibility}
                    onConfirm={this.handleConfirmTglLahir}
                    onCancel={this.onPressCancel} />
                  <View style={{ borderWidth: 1, borderColor: "#F3F3F3", width: WIDTH - 40 }}></View>

                  <Text style={{ fontSize: 16, marginTop: 5 }}>Alamat</Text>
                  <TextInput
                    style={{ fontSize: 16, height: 100 }}
                    placeholder={"Masukkan Alamat"}
                    onChangeText={async (val) => {
                      var tuser = this.state.user;
                      tuser.alamat = val;
                      await this.setState({ user: tuser })
                    }}
                    defaultValue={this.state.user.alamat}

                    placeholderTextColor={"#666872"}
                    underlineColorAndroid="transparent"
                    textAlignVertical={"top"}
                    textBreakStrategy={"highQuality"}
                    multiline={true}
                    keyboardType={"default"}
                    textContentType={"fullStreetAddress"}
                    autoCompleteType={"street-address"}
                  />
                  <View style={{ borderWidth: 1, borderColor: "#F3F3F3", width: WIDTH - 40 }}></View>
                </View>

              </View>
            </ScrollView>
          </KeyboardAvoidingView>
          <View style={{}}>


          </View>

        </SafeAreaView>
        <TouchableOpacity style={{ position: "absolute", bottom: 0, padding: 15, flexDirection: 'row', borderColor: "#F24E1E", borderWidth: 1, marginBottom: -1, alignContent: "space-between", width: WIDTH, backgroundColor: "white", borderTopRightRadius: 15, borderTopLeftRadius: 15, paddingBottom: 20 }} onPress={this.OnSimpan}>


          <Text style={{ fontSize: 14, fontWeight: "bold", flex: 1, textAlign: "center", color: "#F24E1E" }}>Simpan</Text>


        </TouchableOpacity>
      </View>
    );
  }
}

export default EditProfilScreen;

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
