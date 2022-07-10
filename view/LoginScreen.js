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
  ToastAndroid,
  TouchableOpacity,
  TextInput,
  Alert,
  ImageBackground,

} from "react-native";
import * as firebase from "firebase";
import AsyncStorage from '@react-native-async-storage/async-storage'
import Icon from "react-native-vector-icons/Ionicons";

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
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem('@storage_Key:' + key, jsonValue)
  } catch (e) {
    // saving error
    this.notify(e);
    return;
  }
}
const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem('@storage_Key:' + key)
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    // error reading value
    this.notify(e);
    return;
  }
}


class LoginScreen extends React.Component {
  constructor() {
    super();

    this.state = {
      showPass: true,
      press: false,
      username: "",
      password: "",

      isLoading: true,
    };
  }

  checkLogin = async () => {

    
    var user = await getData("user");
    
    if (user != null && user.nama != null) {
      const { navigation } = this.props;
      navigation.navigate("Home");

    }
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
    const { navigation } = this.props;
  };
  onRegister = async () => {
    const { navigation } = this.props;
    navigation.push("Register");
  };
  loginSuccess = () => {
    
    return;
    this.props.navigation.navigate('Chat', {
      name: this.state.name,
      email: this.state.email,
    });
  }; loginFailed = () => {
    alert('Login failure. Please tried again.');
  };
  onLogin = async () => {
    if (this.state.username == "" || this.state.password == "") {
      this.notify("Email atau password kosong");
      return;
    }
    var user = null;
    user = {
      email: this.state.username,
      password: this.state.password,
    };
    // firebase.login(user, this.loginSuccess, this.loginFailed);
    // return;
    await firebase
      .database()
      .ref("users")
      .orderByChild("username")
      .equalTo(this.state.username)
      .on("value", (snapshot) => {
        snapshot.forEach((child) => {
          if (child.key != "count" && child.val().dlt != true) {
            if (child.val().password == this.state.password) {
              user = child.val();
              storeData("user", user);
              const { navigation } = this.props;
              navigation.navigate("HomeTab");
            }
          }
        });

        if (user != null && user.userid != "") {

        }
        else {
          this.notify("User tidak ditemukan");
        }
      });



  };

  async componentDidMount() { await this.checkLogin(); }

  render() {

    const { navigation } = this.props;
    return (
      <View style={styles.container}>
        <ImageBackground
          source={require("./../assets/background.png")}
          style={styles.image}
        >
          <SafeAreaView>
            <View style={styles.logoContainer}>
              <Image
                source={require("./../assets/logo.png")}
                style={{ height: 100, width: 100, justifyContent: 'center', alignItems: 'center', }}
                resizeMode="contain"
              />
              <Text style={styles.logoText}>BiShare</Text>
              <Text style={styles.text}>Marketplace Polibatam</Text>
            </View>

            <View style={styles.bottomContainer}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  onChangeText={(val) => this.setState({ username: val })}
                  placeholder={"Email atau Username"}
                  placeholderTextColor={"#666872"}
                  underlineColorAndroid="transparent"
                />
                <Icon
                  name={"ios-mail-outline"}
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

              <TouchableOpacity onPress={this.onLogin} style={styles.btnLogin}>
                <Text style={styles.text}>Masuk</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={this.onRegister}
                style={styles.btnDaftar}
              >
                <Text style={styles.text}>Belum Punya Akun? Daftar Disini</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </ImageBackground>
      </View>
    );
  }
}

export default LoginScreen;

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
    marginTop: HEIGHT / 25,
    alignItems:"center",
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
