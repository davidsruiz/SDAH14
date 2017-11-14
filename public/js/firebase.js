// var log = function(m) {console.log(m)}
// // dbRefObject.once('value').then(function (snap) {
// //   var data = snap.val();
// //   // log(data);
// //   database = data;
// // });
//
// var database, firebase, dbRefObject;
// if(firebase) {
//
//   // Reference to db root
//   dbRefObject = firebase.database().ref().child('hymn_popularity');
//
//   dbRefObject.on('value', function (snap) {
//     var data = snap.val();
//     // log(data);
//     database = data;
//   });
//
// }
//
// export function writeToDatabase(path, value) { if(!database) return;
//   dbRefObject.child(path).set(value);
// }
//
// export function updateHymnPopularity(language, hymn_number) { if(!database) return;
//   var newValue = retreiveHymnPopularity(language, hymn_number) + 1;
//   writeToDatabase(language + '/' + hymn_number, newValue)
// }
//
// export function retreiveHymnPopularity(language, hymn_number) { if(!database) return;
//   return database[language][hymn_number] || 0;
// }
//
// export function test() { console.log('test') }
//
// class FirebaseUser {
//
//
//
// }




export default class FirebaseUser {

  constructor(refreshUI) {

    this.storage = localStorage;

    this.refreshUI = refreshUI;

    this.firebase = firebase;
    this.userRef = null;
    this.user = { name: null };

    this.groups = { // referenced
      recents: [],
      favorites: [],
      popular: ['473', '633', '294', '50', '506', '478', '181', '487', '121', '422', '240'],
    };

    this.favorites = new Set();
    this.recents = new Set();

    this.setupAuthentication();

    // this.signin();

  }

  readLocalUserData() {

    if(!this.storage) return;

    let favStr = this.storage.getItem('favorites') || '[]';
    let recStr = this.storage.getItem('recents') || '[]';

    let favArr = JSON.parse(favStr);
    let recArr = JSON.parse(recStr);

    for(let fav of favArr) this.favorites.add(fav);
    for(let rec of recArr) this.recents.add(rec);

    this.saveFavoritesLocally();
    this.saveRecentsLocally();

  }

  setupAuthentication() {

    this.providers = {};

    this.providers.google = new firebase.auth.GoogleAuthProvider();
    this.providers.facebook = new firebase.auth.FacebookAuthProvider();

    firebase.auth().getRedirectResult();

    // firebase.auth().getRedirectResult().then(function(result) {
    //   if (result.credential) {
    //     // This gives you a Google Access Token. You can use it to access the Google API.
    //     var token = result.credential.accessToken;
    //     // ...
    //   }
    //   // The signed-in user info.
    //   var user = result.user;
    // }).catch(function(error) {
    //   // Handle Errors here.
    //   var errorCode = error.code;
    //   var errorMessage = error.message;
    //   // The email of the user's account used.
    //   var email = error.email;
    //   // The firebase.auth.AuthCredential type that was used.
    //   var credential = error.credential;
    //   // ...
    // });

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in.
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        // ...

        this.user.name = user.displayName;
        this.userRef = firebase.database().ref('/users/' + user.uid);
        this.readLocalUserData();
        this.updateUserDataFromCloud(user);

      } else {
        // User is signed out.
        // ...

        this.reset();
        this.readLocalUserData();
        this.syncData();
        // this.refreshUI();
      }
      // ...
    });

  }

  reset() {

    this.userRef = null;
    this.user = { name: null };

    this.favorites = new Set();
    this.recents = new Set();

    this.groups.favorites = [];
    this.groups.recents = [];

  }

  updateUserDataFromCloud(user) {

    // if(user) {
    //
    //   (()=>{
    //
    //     this.userRef.once('value').then((snapshot) => {
    //
    //       if(!snapshot.val()) this.sendNewRecord(user.uid);
    //
    //     });
    //
    //   })();
    //
    // }

    this.userRef.once('value').then((snapshot) => {

      console.log(snapshot.val());

      let favStr = (snapshot.val() && snapshot.val().favorites) || '[]';
      let recStr = (snapshot.val() && snapshot.val().recents) || '[]';

      let favArr = JSON.parse(favStr);
      let recArr = JSON.parse(recStr);

      for(let fav of favArr) this.favorites.add(fav);
      for(let rec of recArr) this.recents.add(rec);

      this.syncData();

      this.saveLocalUserRecordsToCloud();
      this.clearLocalUserData();

    });

  }

  saveLocalUserRecordsToCloud() {

    const favStr = JSON.stringify([...this.favorites]);
    const redStr = JSON.stringify([...this.recents]);

    this.userRef.set({
      favorites: favStr,
      recents: redStr,
    });

  }

  clearLocalUserData() {
    this.clearFavoritesLocally();
    this.clearRecentsLocally();
  }



  googleSignin() {
    firebase.auth().signInWithRedirect(this.providers.google);
  }

  facebookSignin() {
    firebase.auth().signInWithRedirect(this.providers.facebook);
  }


  favorite(n) {
    if(this.favorites.has(n))
      this.removeFavorite(n);
    else
      this.addFavorite(n);
  }

  addFavorite(n) {
    this.favorites.add(n);
    this.saveFavorites();
    this.syncFavorites();
  }

  removeFavorite(n) {
    this.favorites.delete(n);
    this.saveFavorites();
    this.syncFavorites();
  }

  saveFavorites() {
    if(firebase.auth().currentUser) {
      this.saveFavoritesToCloud();
    } else {
      // alert user they are missing out
      this.saveFavoritesLocally();
    }
  }

  saveFavoritesToCloud() {

    const favStr = JSON.stringify([...this.favorites]);

    this.userRef.update({
      favorites: favStr,
    });

  }

  saveFavoritesLocally() {

    if(!this.storage) return;

    const favStr = JSON.stringify([...this.favorites]);

    this.storage.setItem('favorites', favStr);

  }

  clearFavoritesLocally() {

    if(!this.storage) return;

    this.storage.removeItem('favorites');

  }

  syncFavorites() {
    this.groups.favorites = Array.from(this.favorites);
    this.refreshUI();
  }


  recent(n) {
    this.removeRecent(n);
    this.addRecent(n);
  }

  addRecent(n) {
    this.recents.add(n);
    this.saveRecents();
    this.syncRecents();
  }

  removeRecent(n) {
    if(!this.recents.delete(n)) return;
    this.saveRecents();
    this.syncRecents();
  }

  clearRecents() {
    this.recents.clear();
    this.saveRecents();
    this.syncRecents();
  }

  saveRecents() {
    if(firebase.auth().currentUser) {
      this.saveRecentsToCloud();
    } else {
      // alert user they are missing out
      this.saveRecentsLocally();
    }
  }

  saveRecentsToCloud() {

    const favStr = JSON.stringify([...this.recents]);

    this.userRef.update({
      recents: favStr,
    });

  }

  saveRecentsLocally() {

    if(!this.storage) return;

    const recStr = JSON.stringify([...this.recents]);

    this.storage.setItem('recents', recStr);

  }

  clearRecentsLocally() {

    if(!this.storage) return;

    this.storage.removeItem('recents');

  }

  syncRecents() {
    this.groups.recents = Array.from(this.recents);
    this.refreshUI();
  }


  syncData() {
    this.syncFavorites();
    this.syncRecents();
  }


  logout() {
    firebase.auth().signOut();
    this.user.name = null;
    this.refreshUI();

    // firebase.auth().signOut().then(function() {
    //   // Sign-out successful.
    // }).catch(function(error) {
    //   // An error happened.
    // });
  }


}

