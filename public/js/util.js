

const diacritics = ["á", "é", "í", "ó", "ú", "ñ", "ü"];
const alternatives = ["a", "e", "i", "o", "u", "n", "u"];
const punctuation = ["¡", "!", "¿", "?", ".", ",", ";", ":"];

const replaceAll = (str, find, replace) => str.split(find).join(replace);

export function removeDiacritics(str) {
  let new_str = str;
  for(let i = 0; i < diacritics.length; i++) {
    new_str = replaceAll(new_str, diacritics[i], alternatives[i]);
    new_str = replaceAll(new_str, diacritics[i].toUpperCase(), alternatives[i].toUpperCase());
  }
  return new_str;
}


export function removePunctutation(str) {
  let new_str = str;
  for(let i = 0; i < punctuation.length; i++) {
    new_str = replaceAll(new_str, punctuation[i], "");
  }
  return new_str;
}

export function normalizeQuery(query) {
  return removeDiacritics(query.toLowerCase());
}

export function normalizeQueryWithPunctuation(query) {
  return removePunctutation(normalizeQuery(query));
}



// ARRAY FILTERS //

export function clearemptystrings(element) {
  return (element != "");
}

export function clearwhitespace(element) {
  return (element != " ");
}

export function weakRanks(minimumRankValue) {
  return element => (element.rank > minimumRankValue);
}

//               //
