import { StatusBar } from "expo-status-bar";
import React, { Component } from "react";
import {
  SafeAreaView,
  StyleSheet,
  ToastAndroid,
  Text,
  View,
  Image,
  Button,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Alert,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import moment from "moment";
import { Picker } from "@react-native-community/picker";
import * as firebase from "firebase";
import { ScrollView } from "react-native-gesture-handler";
const { width: WIDTH } = Dimensions.get("window");
const HEIGHT = Dimensions.get("window").height;

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
    this.notify(e);
    return;
  }
};

class RegisterScreen extends React.Component {
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
      jeniskelamin: "",
      tanggallahir: "",
      email: "",
      nohp: "",
      alamat: "",
      username: "",
      password: "",
      repassword: "",
      isLoading: false,
    };
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

  showPass = async () => {
    if (this.state.press == false) {
      this.setState({ showPass: false, press: true });
    } else {
      this.setState({ showPass: true, press: false });
    }
  };
  onSubmit = async () => {
    await this.setState({ isLoading: true });
    // var user =
    // {
    //   userid: count,
    //   usercode: "APP" + count,
    //   userdate: Date.now(),
    //   nama: this.state.nama,
    //   jeniskelamin: this.state.jeniskelamin,
    //   tanggallahir: this.state.tanggallahir,
    //   email: this.state.email,
    //   nohp: this.state.nohp,
    //   alamat: "",
    //   status: "customer",
    //   dlt: false,
    //   username: this.state.username,
    //   password: this.state.password
    // }
    //   ;
    // 
    // await firebase.auth()
    //   .createUserWithEmailAndPassword( user.email,user.password      )
    //   .then(() =>
    //   .catch(error => 
    //   await this.setState({ isLoading: false });
    //  var fuser=   await firebase.getCurrentUser();
    //  fuser.sendEmailVerification();
    //   return;

    if (this.state.nama == "") {
      this.notify("Nama kosong");
      return;
    }
    if (this.state.email == "") {
      this.notify("Email kosong");
      return;
    }
    if (this.state.jeniskelamin == "") {
      this.notify("Jenis Kelamin kosong");
      return;
    }
    if (this.state.username == "" || this.state.password == "") {
      this.notify("Username atau password kosong");
      return;
    }
    if (this.state.password != this.state.repassword) {
      this.notify("Password tidak sama");
      return;
    }
    var user = null;
    var validate = true;
    //cek username duplicate
    await firebase
      .database()
      .ref("users")
      .orderByChild("username")
      .equalTo(this.state.username)
      .on("value", (snapshot) => {
        snapshot.forEach((child) => {
          if (child.key != "count" && child.val().dlt != true) {
            validate = false;
          }
        });
      });
    await new Promise((r) => setTimeout(r, 1000));
    if (!validate) {
      this.notify("Username sudah ada");
      return;
    }
    //cek email duplicate

    await firebase
      .database()
      .ref("users")
      .orderByChild("email")
      .equalTo(this.state.email)
      .on("value", (snapshot) => {
        snapshot.forEach((child) => {
          if (child.key != "count" && child.val().dlt != true) {
            validate = false;
          }
        });
      });
    await new Promise((r) => setTimeout(r, 1000));
    if (!validate) {
      this.notify("Email sudah ada");
      return;
    }

    //ambil userid
    var count = 0;
    await firebase
      .database()
      .ref("users/count")
      .on("value", (snapshot) => {
        count = snapshot.val();
      });
    if (count == 0 || count == null)
      await new Promise((r) => setTimeout(r, 1000));
    if (count == 0 || count == null)
      await new Promise((r) => setTimeout(r, 1000));
    if (count == 0 || count == null)
      await new Promise((r) => setTimeout(r, 1000));
    if (count == 0 || count == null)
      await new Promise((r) => setTimeout(r, 1000));

    count++;

    // await firebase.database()
    //   .ref("users/count").set(count);

    await new Promise((r) => setTimeout(r, 1000));
    var user = {
      userid: "",
      usercode: "APP" + count,
      userdate: Date.now(),
      nama: this.state.nama,
      jeniskelamin: this.state.jeniskelamin,
      tanggallahir: this.state.tanggallahir,
      email: this.state.email,
      nohp: this.state.nohp,
      alamat: "",
      status: "customer",
      dlt: false,
      username: this.state.username,
      password: this.state.password,
    };
    user.userid = await firebase.database().ref("users/").push(user).getKey();

 

    if (user != null && user.userid != "") {
      await firebase
      .database()
      .ref("users/" + user.userid)
      .set(user);
      await storeData("user", user);
      const { navigation } = this.props;
      navigation.push("HomeTab");
    }

    await this.setState({ isLoading: false });
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

  handleConfirmTglLahir = (date) => {
    this.setState({ tanggallahir: date });
    this.setState({ visibility: false });
    this.setState({ TextInputDisableStatus: true });
  };
  onLogin = async () => {
    const { navigation } = this.props;
    navigation.push("Login");
  };

  render() {
    const { navigation } = this.props;
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
        }}
      >
        <ImageBackground
          source={require("./../assets/background.png")}
          style={styles.image}
        >
          <SafeAreaView>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>BiShare</Text>
              <Text style={styles.text}>Marketplace Polibatam</Text>
            </View>
            <ScrollView>
              <View style={styles.bottomContainer}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    onChangeText={(val) => this.setState({ nama: val })}
                    placeholder={"Nama"}
                    placeholderTextColor={"#666872"}
                    underlineColorAndroid="transparent"
                  />
                  <Icon
                    name={"ios-person-outline"}
                    size={25}
                    color={"#666872"}
                    style={styles.inputIcon}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    onChangeText={(val) => this.setState({ email: val.trim() })}
                    placeholder={"Email"}
                    placeholderTextColor={"#666872"}
                    underlineColorAndroid="transparent"
                    autoCompleteType="email"
                    keyboardType="email-address"
                  />
                  <Icon
                    name={"ios-mail-outline"}
                    size={25}
                    color={"#666872"}
                    style={styles.inputIcon}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <View style={styles.input}>
                    <Picker
                      mode="dropdown"
                      style={{ margin: -4 }}
                      selectedValue={this.state.jeniskelamin}
                      placeholder="Pilih Jurusan"
                      placeholderTextColor={"#B2B5BF"}
                      underlineColorAndroid="transparent"
                      onValueChange={(itemValue, itemIndex) =>
                        this.setState({ jeniskelamin: itemValue })
                      }
                    >
                      <Picker.Item label="Pilih Jenis Kelamin" value="" />
                      <Picker.Item label="Male" value="m" />
                      <Picker.Item label="Female" value="f" />
                    </Picker>
                  </View>
                  <Icon
                    name={"ios-male-female-outline"}
                    size={25}
                    color={"#666872"}
                    style={styles.inputIcon}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    onChangeText={(val) => this.setState({ nohp: val })}
                    placeholder={"No HP"}
                    placeholderTextColor={"#666872"}
                    underlineColorAndroid="transparent"
                    autoCompleteType="tel"
                    keyboardType="phone-pad"
                  />
                  <Icon
                    name={"ios-phone-portrait-outline"}
                    size={25}
                    color={"#666872"}
                    style={styles.inputIcon}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder={"Tanggal Lahir Kamu"}
                    placeholderTextColor={"#666872"}
                    underlineColorAndroid="transparent"
                    // pointerEvents="none"
                    editable={this.state.TextInputDisableStatus}
                    pointerEvents="none"
                    selectTextOnFocus={false}
                    onTouchStart={this.onPressButton}
                    value={
                      this.state.tanggallahir
                        ? moment(this.state.tanggallahir).format(
                            this.state.displayFormat
                          )
                        : ""
                    }
                  />
                  <DateTimePickerModal
                    mode="date"
                    isVisible={this.state.visibility}
                    onConfirm={this.handleConfirmTglLahir}
                    onCancel={this.onPressCancel}
                  />
                  <Icon
                    name={"ios-calendar-outline"}
                    size={25}
                    color={"#666872"}
                    style={styles.inputIcon}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    onChangeText={(val) => this.setState({ username: val })}
                    placeholder={"Username"}
                    placeholderTextColor={"#666872"}
                    underlineColorAndroid="transparent"
                    autoCompleteType="username"
                  />
                  <Icon
                    name={"ios-person-outline"}
                    size={25}
                    color={"#666872"}
                    style={styles.inputIcon}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder={"Password"}
                    onChangeText={(val) => this.setState({ password: val })}
                    secureTextEntry={this.state.showPass}
                    placeholderTextColor={"#666872"}
                    underlineColorAndroid="transparent"
                  />
                  <Icon
                    name={"ios-lock-closed-outline"}
                    size={25}
                    color={"#666872"}
                    style={styles.inputIcon}
                  />

                  <TouchableOpacity
                    style={styles.btnEye}
                    onPress={this.showPass.bind(this)}
                  >
                    <Icon
                      name={
                        this.state.press == false
                          ? "ios-eye-outline"
                          : "ios-eye-off-outline"
                      }
                      size={25}
                      color={"#666872"}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder={"Re-Password"}
                    onChangeText={(val) => this.setState({ repassword: val })}
                    secureTextEntry={this.state.showPass}
                    placeholderTextColor={"#666872"}
                    underlineColorAndroid="transparent"
                  />
                  <Icon
                    name={"ios-lock-closed-outline"}
                    size={25}
                    color={"#666872"}
                    style={styles.inputIcon}
                  />

                  <TouchableOpacity
                    style={styles.btnEye}
                    onPress={this.showPass.bind(this)}
                  >
                    <Icon
                      name={
                        this.state.press == false
                          ? "ios-eye-outline"
                          : "ios-eye-off-outline"
                      }
                      size={25}
                      color={"#666872"}
                    />
                  </TouchableOpacity>
                </View>
                <ActivityIndicator
                  size="large"
                  color="#F24E1E"
                  animating={this.state.isLoading}
                />
                <TouchableOpacity
                  onPress={this.onSubmit}
                  style={styles.btnLogin}
                >
                  <Text style={styles.text}>Daftar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={this.onLogin}
                  style={styles.btnDaftar}
                >
                  <Text style={styles.text}>
                    Sudah Punya akun? Login Disini
                  </Text>
                </TouchableOpacity>
                <View style={{ height: HEIGHT / 4 }}></View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </ImageBackground>
      </View>
    );
  }
}

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
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
    marginTop: 100,
    justifyContent: "center",
  },
  bottomContainer: {
    marginTop: 10,
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
  btnLupaPassword: {
    width: WIDTH - 55,
    height: 45,
    borderRadius: 10,
    fontSize: 16,
    color: "#ffffff",
    justifyContent: "center",
    marginTop: 20,
  },
  btnDaftar: {
    width: WIDTH - 55,
    height: 45,
    borderRadius: 10,
    fontSize: 16,
    color: "#F24E1E",
    justifyContent: "center",
    marginTop: 20,
  },
  btnRegis: {
    width: WIDTH - 55,
    height: 45,
    borderStyle: "solid",
    borderWidth: 2,
    borderRadius: 10,
    fontSize: 16,
    borderColor: "#666872",
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
  },
  inputIcon: {
    position: "absolute",
    borderColor: "#666872",
    top: 8,
    left: 37,
    paddingRight: 5,
    borderRightWidth: 1,
  },
  btnEye: {
    position: "absolute",
    top: 8,
    right: 37,
  },
});
