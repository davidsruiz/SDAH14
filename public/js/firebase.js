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

import EventProtocol from './eventProtocol.js';
import PracticalStorage from './practicalStorage.js';
import { usableLocalStorage, Enum, uniqueElements, arrayContains } from './util.js'

// const Themes = Enum('light', 'dark', 'purple', 'yellow');

export default class FirebaseUser extends EventProtocol {

  constructor() {
    super();

    this.themeCount = 4;

    this.storage = new PracticalStorage();

    this.resetUser();

    this.popularHymns = {
      en1985: ['473', '633', '294', '50', '506', '478', '181', '487', '121', '422', '240'],
      es2010: ["47", "344", "103", "250", "252", "29", "169", "436", "34", "328"],
    };
    this.updateRelevantPopularHymns();


    // catch up if temp data in storage
    this.storageOverrideLocal();

    // create temp storage data for in case no account
    this.localOverwriteStorage();

    // attempt establish firebase connection
    this.authOnFirebase();

    // setup google and facebook signin providers
    this.prepareSignInMethods();


    setTimeout(()=>{
      this.execListeners('load');
    }, 10);

  }

  // computed props

  get signedIn() {
    return !!firebase.auth().currentUser;
  }


  // methods

  storageToLocal() {

    // how can we do this..? (should we do this?)

    if(!usableLocalStorage()) return;

    let temporaryUserData = this.storage.read('temporaryUserData');
    if(temporaryUserData) {

      // const {
      //   favorites,
      //   recents,
      //   theme,
      //   language,
      //   hymnal,
      // } = temporaryUserData;
      //
      // if(favorites) this.localUser.favorites = favorites;
      // if(recents) this.localUser.recents = recents;
      // if(theme) this.localUser.theme = theme;
      // if(language) this.localUser.language = language;
      // if(hymnal) this.localUser.theme = hymnal;

    }

  }

  storageOverrideLocal() {

    if(!usableLocalStorage()) return;

    let temporaryUserData = this.storage.read('temporaryUserData');
    if(temporaryUserData) {
      this.localUser = temporaryUserData;
    }

  }

  localToStorage() {

  }

  localOverwriteStorage() {
    this.storage.write('temporaryUserData', this.localUser);
  }

  prepareSignInMethods() {

    this.setupProviders();

  }

  setupProviders() {

    this.providers = {};

    this.providers.google = new firebase.auth.GoogleAuthProvider();
    this.providers.facebook = new firebase.auth.FacebookAuthProvider();

  }

  authOnFirebase() {

    // log in
    firebase.auth().getRedirectResult()

      // if firebase auth not accessible
      .catch(error => {
        console.error(error);
      });

    // on not-signed-in or signed-in or logged-out
    firebase.auth().onAuthStateChanged((user) => {

      if(user) {

        this.saveDBRef(user);
        this.cloudToLocal(() => {
          this.localOverwriteCloud();
          this.clearStorage();
          this.localToView();
        });

      } else {

        this.resetUser();
        this.storageOverrideLocal(); // todo fix <<
        this.localToView();

      }

    });
  }

  saveDBRef(user) {
    this.userRef = firebase.database().ref('/users/' + user.uid);
  }

  cloudToLocal(callback) {

    // name

    this.localUser.name = this.signedIn ? firebase.auth().currentUser.displayName : null;


    // save data

    this.userRef.once('value').then((snapshot) => {

      const cloudDataStr = snapshot.val();

      if(cloudDataStr) {

        const cloudData = JSON.parse(cloudDataStr);
        console.log(cloudData);

        // favorites

        for(let language in cloudData.favorites) {
          // required for obj iteration
          if(!cloudData.favorites.hasOwnProperty(language)) continue;

          // if local user has registered language, merge locally
          if(this.localUser.favorites[language]) {
            this.localUser.favorites[language] =
              uniqueElements(this.localUser.favorites[language].concat(cloudData.favorites[language]));
          }
          // else override locally
          else {
            this.localUser.favorites[language] = cloudData.favorites[language];
          }

        }

        // recents

        for(let language in cloudData.recents) {
          // required for obj iteration
          if(!cloudData.recents.hasOwnProperty(language)) continue;

          // if cloud has registered language, merge locally
          if(this.localUser.recents[language]) {
            this.localUser.recents[language] =
              uniqueElements(this.localUser.recents[language].concat(cloudData.recents[language]));
          }
          // else override locally
          else {
            this.localUser.recents[language] = cloudData.recents[language];
          }

        }

        // theme language and hymnal
        this.localUser.theme = cloudData.theme;
        this.localUser.language = cloudData.language;
        this.localUser.hymnal = cloudData.hymnal;

      }


      // continue execution
      callback && callback();

    });

  }

  localOverwriteCloud() {
    const localUserStr = JSON.stringify(this.localUser);
    this.userRef.set(localUserStr);
  }

  localToCloud() {
    const localUserStr = JSON.stringify(this.localUser);
    this.userRef.update(localUserStr);
  }

  clearStorage() {
    this.storage.clear('temporaryUserData');
  }

  localToView() {

    this.simpleUser.name = this.localUser.name;
    this.simpleUser.favorites = this.localUser.favorites[this.localUser.hymnal] || [];
    this.simpleUser.recents = this.localUser.recents[this.localUser.hymnal] || [];
    this.simpleUser.theme = this.localUser.theme;
    this.simpleUser.language = this.localUser.language;
    this.simpleUser.hymnal = this.localUser.hymnal;

    this.execListeners('data update');

  }

  resetUser() {

    this.localUser = {

      name: null,
      favorites: {},
      recents: {},
      theme: 0,
      language: null,
      hymnal: 'en1985',

    };

    this.simpleUser = {

      name: null,
      favorites: [],
      recents: [],
      theme: 0,
      language: null,
      hymnal: 'en1985',

    };

  }


  googleSignin() {
    firebase.auth().signInWithRedirect(this.providers.google);
  }

  facebookSignin() {
    firebase.auth().signInWithRedirect(this.providers.facebook);
  }


  // ~ favorites
  favorite(n) {
    if(this.hasFavorite(n))
      this.removeFavorite(n);
    else
      this.addFavorite(n);
  }

  hasFavorite(n) {
    const favorites = this.localUser.favorites[this.localUser.hymnal] || [];
    return arrayContains(favorites, n);
  }

  addFavorite(n) {
    this.addFavoriteToLocal(n);
    this.saveFavorites();
    this.localToView();
  }

  removeFavorite(n) {
    this.removeFavoriteFromLocal(n);
    this.saveFavorites();
    this.localToView();
  }

  addFavoriteToLocal(n) {
    const favorites = this.localUser.favorites[this.localUser.hymnal] || [];
    favorites.push(n);
    this.localUser.favorites[this.localUser.hymnal] = favorites;
  }

  removeFavoriteFromLocal(n) {
    const favorites = this.localUser.favorites[this.localUser.hymnal];
    if(favorites) {
      const index = favorites.indexOf(n);
      index !== -1 && favorites.splice(index, 1)
    }
  }

  saveFavorites() {
    if(this.signedIn) {
      this.localOverwriteCloud();
    } else {
      // alert user they are missing out
      this.localOverwriteStorage();
    }
  }

  saveChanges() {
    if(this.signedIn)
      this.localOverwriteCloud();
    else
      this.localOverwriteStorage();
  }

  // ~ recents
  recent(n) {
    this.removeRecent(n);
    this.addRecent(n);
  }

  addRecent(n) {
    this.addRecentToLocal(n);
    this.saveChanges();
    this.localToView();
  }

  removeRecent(n) {
    this.removeRecentFromLocal(n);
    this.saveChanges();
    this.localToView();
  }

  addRecentToLocal(n) {
    const recents = this.localUser.recents[this.localUser.hymnal] || [];
    recents.push(n);
    this.localUser.recents[this.localUser.hymnal] = recents;
  }

  removeRecentFromLocal(n) {
    const recents = this.localUser.recents[this.localUser.hymnal];
    if(recents) {
      const index = recents.indexOf(n);
      index !== -1 && recents.splice(index, 1)
    }
  }

  clearRecents() {
    this.removeAllRecentsFromLocal();
    this.saveChanges();
    this.localToView();
  }

  removeAllRecentsFromLocal() {
    this.localUser.recents[this.localUser.hymnal] = [];
  }

  // ~ theme
  cycleTheme() {
    const nextTheme = this.nextTheme(this.localUser.theme);
    this.setTheme(nextTheme);
  }

  nextTheme(currentTheme) {
    let next = currentTheme + 1;
    return (next < this.themeCount) ? next : 0;
  }

  setTheme(n) {
    this.setThemeToLocal(n);
    this.saveChanges();
    this.localToView();
  }

  setThemeToLocal(n) {
    this.localUser.theme = n;
  }

  // ~ language
  setLanguage(langCode) {
    this.setLanguageToLocal(langCode);
    this.saveChanges();
    this.localToView();
  }

  setLanguageToLocal(langCode) {
    this.localUser.language = langCode;
  }

  // ~ hymnal
  setHymnal(hymnalCode) {
    this.setHymnalToLocal(hymnalCode);
    this.updateRelevantPopularHymns();
    this.saveChanges();
    this.localToView();
  }

  setHymnalToLocal(hymnalCode) {
    this.localUser.hymnal = hymnalCode;
  }


  // popular
  updateRelevantPopularHymns() {
    this.relevantPopular = this.popularHymns[this.localUser.hymnal] || [];
  }



  logout() {
    firebase.auth().signOut();
  }


}

