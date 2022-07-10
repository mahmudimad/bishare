import firebase from 'firebase';
class FirebaseSvc {
  constructor() {
    if (!firebase.apps.length) { //avoid re-initializing
      firebase.initializeApp({
        apiKey: "AIzaSyAG7oZ5gK_4JfibKyOXG4oXqleART-e8vA",
        authDomain: "bishare-48db5.firebaseapp.com",
        databaseURL: "https://bishare-48db5-default-rtdb.firebaseio.com/",
        projectId: "bishare-48db5",
        storageBucket: "bishare-48db5.appspot.com",
        messagingSenderId: "sender-id",
        appId: "1:250899433800:android:982f8764221e4e5666cb7d",
        measurementId: "G-measurement-id",
      });
    }


  }
  login = async (user, success_callback, failed_callback) => {
    await firebase.auth()
      .signInWithEmailAndPassword(user.email, user.password)
      .then(success_callback, failed_callback);
  }

  createAccount = async (user) => {
    firebase.auth()
      .createUserWithEmailAndPassword(user.email, user.password)
      .then(function () {
        var userf = firebase.auth().currentUser;
        userf.updateProfile({ displayName: user.name })
          .then(function () {
            alert("User " + user.name + " was created successfully.");
          }, function (error) {
            console.warn("Error update displayName.");
          });
      }, function (error) {
        console.error("got error:" + error.message);
        alert("Create account failed.");
      });
  }

  uploadImage = async uri => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const ref = firebase.storage().ref('avatar').child(uuid.v4());
      const task = ref.put(blob);
      return new Promise((resolve, reject) => {
        task.on('state_changed', () => { }, reject,
          () => resolve(task.snapshot.downloadURL));
      });
    } catch (err) {
      
    }
  }

  refOn = callback => {
    this.ref
      .limitToLast(20)
      .on('child_added', snapshot => callback(this.parse(snapshot)));
  }

  parse = snapshot => {
    const { timestamp: numberStamp, text, user } = snapshot.val();
    const { key: _id } = snapshot;
    const timestamp = new Date(numberStamp);
    const message = { _id, timestamp, text, user };
    return message;
  };

  send = messages => {
    for (let i = 0; i < messages.length; i++) {
      const { text, user } = messages[i];
      const message = { text, user, createdAt: this.timestamp, };
      this.ref.push(message);
    }
  };

} 
const firebaseSvc = new FirebaseSvc();
export default firebaseSvc;
