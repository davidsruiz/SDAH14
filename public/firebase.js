var log = function(m) {console.log(m)}
// dbRefObject.once('value').then(function (snap) {
//   var data = snap.val();
//   // log(data);
//   database = data;
// });

var database, firebase, dbRefObject;
if(firebase) {

  // Reference to db root
  dbRefObject = firebase.database().ref().child('hymn_popularity');

  dbRefObject.on('value', function (snap) {
    var data = snap.val();
    // log(data);
    database = data;
  });

}

function writeToDatabase(path, value) { if(!database) return;
  dbRefObject.child(path).set(value);
}

function updateHymnPopularity(language, hymn_number) { if(!database) return;
  var newValue = retreiveHymnPopularity(language, hymn_number) + 1;
  writeToDatabase(language + '/' + hymn_number, newValue)
}

function retreiveHymnPopularity(language, hymn_number) { if(!database) return;
  return database[language][hymn_number] || 0;
}
