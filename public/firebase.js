var log = m => console.log(m)
// dbRefObject.once('value').then(function (snap) {
//   var data = snap.val();
//   // log(data);
//   database = data;
// });

// Reference to db root
const dbRefObject = firebase.database().ref().child('hymn_popularity');
log(dbRefObject)

var database;
dbRefObject.on('value', function (snap) {
  var data = snap.val();
  // log(data);
  database = data;
});

function writeToDatabase(path, value) {
  dbRefObject.child(path).set(value);
}

function updateHymnPopularity(language, hymn_number) {
  if(!database) return;
  var newValue = retreiveHymnPopularity(language, hymn_number) + 1;
  writeToDatabase(language + '/' + hymn_number, newValue)
}

function retreiveHymnPopularity(language, hymn_number) {
  return database[language][hymn_number] || 0;
}
