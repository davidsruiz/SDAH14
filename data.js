// Array Extension //
Array.prototype.lastChild = function () {
    return this[this.length - 1];
}

var notUndefined = function(x) { return x !== undefined };


String.prototype.replaceAll = function(find, replace) { return this.split(find).join(replace) }
String.prototype.removeDiacritics = function() {
  var new_str = this;
  var diacritics = ["á", "é", "í", "ó", "ú", "ñ", "ü"];
  var alternatives = ["a", "e", "i", "o", "u", "n", "u"];
  for(var i = 0; i < diacritics.length; i++) {
    new_str = new_str.replaceAll(diacritics[i], alternatives[i]);
    new_str = new_str.replaceAll(diacritics[i].toUpperCase(), alternatives[i].toUpperCase());
  }
  return new_str;
}
String.prototype.removePunctutation = function() {
  var new_str = this;
  var punctuation = ["¡", "!", "¿", "?", ".", ",", ";", ":"];
  for(var i = 0; i < punctuation.length; i++) {
    new_str = new_str.replaceAll(punctuation[i], "");
  }
  return new_str;
}

// LOAD HYMNAL !!
var defaultHymnal = "en";
var hymnal, data, categories, language, hymnal_id;
function loadHymnal(id) {
  if(!(hymnal = HYMNAL_DATA[id])) return false; // e.g. "en", "sp2010", "sp1960"
  hymnal_id = id;
  data = hymnal.data;
  categories = hymnal.categories;
  language = hymnal.language;
  return true;
}
//             !!

function categoryFromNumber(n) {
  var main = categories.main;
  for(var i = 1; i < main[0].length; i++) {
    var limit = main[0][i];
    if(n <= limit) return main[1][i-1];
  }
}

function subcategoryFromNumber(n) {
  var sub = categories.sub;
  for(var i = 1; i < sub[0].length; i++) {
    var limit = sub[0][i];
    if(n <= limit) return sub[1][i-1];
  }
}

// /*var CATEGORY = ["Worship", "Trinity", "God the Father", "Jesus Christ", "Holy Spirit", "Holy Scriptures", "Gospel", "Christian Church", "Doctrines", "Early Advent", "Christian Life", "Christian Home", "Sentences and Responses"];*/
// var _SUBCATEGORY = ["Adoration and Praise", "Morning Worship", "Evening Worship", "Opening of Worship", "Close of Worship", "Love of God", "Majesty and Power of God", "Power of God in Nature", "Faithfulness of God", "Grace and Mercy of God", "First Advent", "Birth", "Life and Ministry", "Sufferings and Death", "Resurrection and Ascension", "Priesthood", "Love of Christ for Us", "Second Advent", "Kingdom and Reign", "Glory and Praise", "Invitation", "Repentance", "Forgiveness", "Consecration", "Baptism", "Salvation and Redemption", "Community in Christ", "Mission of the Church", "Church Dedication", "Ordination", "Child Dedication", "Sabbath", "Communion", "Law and Grace", "Spiritual Gifts", "Judgment", "Resurrection of the Saints", "Eternal Life", "Our Love for God", "Joy and Peace", "Hope and Comfort", "Meditation and Prayer", "Faith and Trust", "Guidance", "Thankfulness", "Humility", "Loving Service", "Love for One Another", "Obedience", "Watchfulness", "Christian Warfare", "Pilgrimage", "Stewardship", "Health and Wholeness", "Love of the Country", "Love in the Home", "Marriage"];
//
//
// //["Worship", "Trinity", "God the Father", "Jesus Christ", "Holy Spirit", "Holy Scriptures", "Gospel", "Christian Church", "Doctrines", "Early Advent", "Christian Life", "Christian Home", "Sentences and Responses"];
// var _CATEGORY = [["Adoration and Praise", "Morning Worship", "Evening Worship", "Opening of Worship", "Close of Worship"], [], ["Love of God", "Majesty and Power of God", "Power of God in Nature", "Faithfulness of God", "Grace and Mercy of God"], ["First Advent", "Birth", "Life and Ministry", "Sufferings and Death", "Resurrection and Ascension", "Priesthood", "Love of Christ for Us", "Second Advent", "Kingdom and Reign", "Glory and Praise"], [], [], ["Invitation", "Repentance", "Forgiveness", "Consecration", "Baptism", "Salvation and Redemption"], ["Community in Christ", "Mission of the Church", "Church Dedication", "Ordination", "Child Dedication"], ["Sabbath", "Communion", "Law and Grace", "Spiritual Gifts", "Judgment", "Resurrection of the Saints", "Eternal Life"], [], ["Our Love for God", "Joy and Peace", "Hope and Comfort", "Meditation and Prayer", "Faith and Trust", "Guidance", "Thankfulness", "Humility", "Loving Service", "Love for One Another", "Obedience", "Watchfulness", "Christian Warfare", "Pilgrimage", "Stewardship", "Health and Wholeness", "Love of the Country"], ["Love in the Home", "Marriage"], []];
//
// _CATEGORY[0].name = "Worship";
// _CATEGORY[1].name = "Trinity";
// _CATEGORY[2].name = "God the Father";
// _CATEGORY[3].name = "Jesus Christ";
// _CATEGORY[4].name = "Holy Spirit";
// _CATEGORY[5].name = "Holy Scriptures";
// _CATEGORY[6].name = "Gospel";
// _CATEGORY[7].name = "Christian Church";
// _CATEGORY[8].name = "Doctrines";
// _CATEGORY[9].name = "Early Advent";
// _CATEGORY[10].name = "Christian Life";
// _CATEGORY[11].name = "Christian Home";
// _CATEGORY[12].name = "Sentences and Responses";
//
//
//
// _CATEGORY.contains = function (string) {
//     return this.map(function (arr) {return arr.name.toLowerCase()}).indexOf(string.toLowerCase());
// }
//
// /*SUBCATEGORY.contains = function (string) {
//     return (this.map(function (str) {return str.toLowerCase()}).indexOf(string.toLowerCase()) != -1);
// }*/
//
// for(var s = 0; s < _CATEGORY.length; s++) {
//     _CATEGORY[s].contains = function (string) {
//         return this.map(function (str) {return str.toLowerCase()}).indexOf(string.toLowerCase());
//     }
// }

function categoryFoundWithName(informal) {
  return !!officialCategoryName(informal)
}

function subcategoryFoundWithName(informal) {
  return !!officialSubcategoryName(informal)
}

function officialCategoryName(informal) {
  var index = categories.main[1].map(function(c){return c ? c.toLowerCase().removeDiacritics() : c}).indexOf(informal.toLowerCase().removeDiacritics())
  if(index !== -1) return categories.main[1][index];
}

function officialSubcategoryName(informal) {
  var index = categories.sub[1].map(function(c){return c ? c.toLowerCase().removeDiacritics() : c}).indexOf(informal.toLowerCase().removeDiacritics())
  if(index !== -1) return categories.sub[1][index];
}

function categoryHolds(category, subcategory) {
  if(!category || !subcategory) return false;
  var cat_index = categories.main[1].indexOf(category);
  var sub_index = categories.sub[1].indexOf(category);
  var sub_upper_limit = categories.sub[0][sub_index+1], cat_upper_limit = categories.main[cat_index+1], cat_lower_limit = categories.main[cat_index]
  return (sub_upper_limit) > (cat_lower_limit) && (sub_upper_limit) <= (cat_upper_limit)
}

function CATEGORY(name) {
    var index = _CATEGORY.contains(name);
    if(index != -1) return _CATEGORY[index];
    return -1;
}

function SUBCATEGORY(name) {
    for(var s = 0; s < _CATEGORY.length; s++) {
        var index = _CATEGORY[s].contains(name);
        if(index != -1) return _CATEGORY[s][index];
    }
    return -1;
}

CATEGORY.contains = function (string) {
    return (_CATEGORY.map(function (arr) {return arr.name.toLowerCase()}).indexOf(string.toLowerCase()) != -1);
}
SUBCATEGORY.contains = function (string) {
    return (_SUBCATEGORY.map(function (str) {return str.toLowerCase()}).indexOf(string.toLowerCase()) != -1);
}
