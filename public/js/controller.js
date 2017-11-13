
import EventProtocol from './eventProtocol.js';
import { data as hymnalsData } from "../resources/objects/hymnal_data.js"

class SDAHymnal {

  constructor() {

    this.language = 'en';

    this._favorites = new Favorites();



    this.loadHymnal();



  }

  get reactTree() {
    return ({
      options: {
        language: this.language,
      },
      actions: {
        favorite: (a) => this.favorite(a),
        unfavorite: (a) => this.favorite(a),
        cycleColor: () => {},
        openHymn: () => {},
      }
    });
  }

  // hymnal

  loadHymnal(hymnalID = 'en1985') {

    this.loadedHymnal = this.searchHymnals(hymnalID);

    return !!this.loadedHymnal;

  }

  searchHymnals(hymnalID) {
    for(const languages of hymnalsData)
      for(const hymnal of languages)
        if(hymnal.id === hymnalID)
          return hymnal;
  }



  // favorites

  favorite(n) {
    this._favorites.save(n, this.hymnal.id)
  }

  unfavorite(n) {
    this._favorites.unsave(n, this.hymnal.id)
  }



}

class Favorites {

  constructor() {

    this.data = new Map();

  }

  save(hymn, hymnalID) {
    const list = this.data.get(hymnalID) || new Set();
    list.add(hymn);
    this.data.set(hymnalID, list);
  }

  unsave(hymn, hymnalID) {
    const list = this.data.get(hymnalID);
    if(list) return list.delete(hymn);
  }


}

