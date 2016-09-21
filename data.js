// Array Extension //
Array.prototype.lastChild = function () {
    return this[this.length - 1];
}

// var data = new Array();
//
// var file = "../resources/objects/en1985.txt";
// var allText;
// var rawFile = new XMLHttpRequest();
// rawFile.open("GET", file, false);
// rawFile.onreadystatechange = function ()
// {
//     if(rawFile.readyState === 4)
//     {
//         if(rawFile.status === 200 || rawFile.status == 0)
//         {
//             allText = rawFile.responseText;
//         }
//     }
// }
// rawFile.send(null);
//
// var data = JSON.parse(allText);

var data = HYMNAL_DATA["English"];


function findCat(hymnnumber) {
    var category = "";
    if(hymnnumber < 1) {
        category = -1;
    } else if(hymnnumber < 70) {
        category = "Worship";
    } else if(hymnnumber < 74) {
        category = "Trinity";
    } else if(hymnnumber < 115) {
        category = "God the Father";
    } else if(hymnnumber < 257) {
        category = "Jesus Christ";
    } else if(hymnnumber < 271) {
        category = "Holy Spirit";
    } else if(hymnnumber < 279) {
        category = "Holy Scriptures";
    } else if(hymnnumber < 344) {
        category = "Gospel";
    } else if(hymnnumber < 380) {
        category = "Christian Church";
    } else if(hymnnumber < 438) {
        category = "Doctrines";
    } else if(hymnnumber < 455) {
        category = "Early Advent";
    } else if(hymnnumber < 650) {
        category = "Christian Life";
    } else if(hymnnumber < 660) {
        category = "Christian Home";
    } else if(hymnnumber <= 695){
        category = "Sentences and Responses";
    } else {
        category = -1;
    }


    return category;
}

function findSub(hymnnumber) {
    var subcategory = "";
    if(hymnnumber < 1) {
        subcategory = -1;
    } else if(hymnnumber < 70) {
        if(hymnnumber < 39) {
            subcategory = "Adoration and Praise";
        } else if(hymnnumber < 46) {
            subcategory = "Morning Worship";
        } else if(hymnnumber < 59) {
            subcategory = "Evening Worship";
        } else if(hymnnumber < 64) {
            subcategory = "Opening of Worship";
        } else {
            subcategory = "Close of Worship";
        }
    } else if(hymnnumber < 74) {
        subcategory = undefined;
    } else if(hymnnumber < 115) {
        if(hymnnumber < 82) {
            subcategory = "Love of God";
        } else if(hymnnumber < 92) {
            subcategory = "Majesty and Power of God";
        } else if(hymnnumber < 99) {
            subcategory = "Power of God in Nature";
        } else if(hymnnumber < 105) {
            subcategory = "Faithfulness of God";
        } else {
            subcategory = "Grace and Mercy of God";
        }
    } else if(hymnnumber < 257) {
        if(hymnnumber < 118) {
            subcategory = "First Advent";
        } else if(hymnnumber < 144) {
            subcategory = "Birth";
        } else if(hymnnumber < 154) {
            subcategory = "Life and Ministry";
        } else if(hymnnumber < 165) {
            subcategory = "Sufferings and Death";
        } else if(hymnnumber < 177) {
            subcategory = "Resurrection and Ascension";
        } else if(hymnnumber < 181) {
            subcategory = "Priesthood";
        } else if(hymnnumber < 200) {
            subcategory = "Love of Christ for Us";
        } else if(hymnnumber < 222) {
            subcategory = "Second Advent";
        } else if(hymnnumber < 228) {
            subcategory = "Kingdom and Reign";
        } else {
            subcategory = "Glory and Praise";
        }
    } else if(hymnnumber < 271) {
        subcategory = undefined;
    } else if(hymnnumber < 279) {
        subcategory = undefined;
    } else if(hymnnumber < 344) {
        if(hymnnumber < 291) {
            subcategory = "Invitation";
        } else if(hymnnumber < 297) {
            subcategory = "Repentance";
        } else if(hymnnumber < 301) {
            subcategory = "Forgiveness";
        } else if(hymnnumber < 332) {
            subcategory = "Consecration";
        } else if(hymnnumber < 334) {
            subcategory = "Baptism";
        } else {
            subcategory = "Salvation and Redemption";
        }
    } else if(hymnnumber < 380) {
        if(hymnnumber < 355) {
            subcategory = "Community in Christ";
        } else if(hymnnumber < 376) {
            subcategory = "Mission of the Church";
        } else if(hymnnumber < 377) {
            subcategory = "Church Dedication";
        } else if(hymnnumber < 379) {
            subcategory = "Ordination";
        } else {
            subcategory = "Child Dedication";
        }
    } else if(hymnnumber < 438) {
        if(hymnnumber < 396) {
            subcategory = "Sabbath";
        } else if(hymnnumber < 412) {
            subcategory = "Communion";
        } else if(hymnnumber < 413) {
            subcategory = "Law and Grace";
        } else if(hymnnumber < 415) {
            subcategory = "Spiritual Gifts";
        } else if(hymnnumber < 418) {
            subcategory = "Judgment";
        } else if(hymnnumber < 420) {
            subcategory = "Resurrection of the Saints";
        } else {
            subcategory = "Eternal Life";
        }
    } else if(hymnnumber < 455) {
        subcategory = undefined;
    } else if(hymnnumber < 650) {
        if(hymnnumber < 461) {
            subcategory = "Our Love for God";
        } else if(hymnnumber < 472) {
            subcategory = "Joy and Peace";
        } else if(hymnnumber < 478) {
            subcategory = "Hope and Comfort";
        } else if(hymnnumber < 506) {
            subcategory = "Meditation and Prayer";
        } else if(hymnnumber < 536) {
            subcategory = "Faith and Trust";
        } else if(hymnnumber < 556) {
            subcategory = "Guidance";
        } else if(hymnnumber < 567) {
            subcategory = "Thankfulness";
        } else if(hymnnumber < 571) {
            subcategory = "Humility";
        } else if(hymnnumber < 585) {
            subcategory = "Loving Service";
        } else if(hymnnumber < 590) {
            subcategory = "Love for One Another";
        } else if(hymnnumber < 592) {
            subcategory = "Obedience";
        } else if(hymnnumber < 606) {
            subcategory = "Watchfulness";
        } else if(hymnnumber < 620) {
            subcategory = "Christian Warfare";
        } else if(hymnnumber < 634) {
            subcategory = "Pilgrimage";
        } else if(hymnnumber < 642) {
            subcategory = "Stewardship";
        } else if(hymnnumber < 645) {
            subcategory = "Health and Wholeness";
        } else {
            subcategory = "Love of the Country";
        }
    } else if(hymnnumber < 660) {
        if(hymnnumber < 656) {
            subcategory = "Love in the Home";
        } else {
            subcategory = "Marriage";
        }
    } else if(hymnnumber <= 695){
        subcategory = undefined;
    } else {
        subcategory = -1;
    }

    return subcategory;
}

/*var CATEGORY = ["Worship", "Trinity", "God the Father", "Jesus Christ", "Holy Spirit", "Holy Scriptures", "Gospel", "Christian Church", "Doctrines", "Early Advent", "Christian Life", "Christian Home", "Sentences and Responses"];*/
var _SUBCATEGORY = ["Adoration and Praise", "Morning Worship", "Evening Worship", "Opening of Worship", "Close of Worship", "Love of God", "Majesty and Power of God", "Power of God in Nature", "Faithfulness of God", "Grace and Mercy of God", "First Advent", "Birth", "Life and Ministry", "Sufferings and Death", "Resurrection and Ascension", "Priesthood", "Love of Christ for Us", "Second Advent", "Kingdom and Reign", "Glory and Praise", "Invitation", "Repentance", "Forgiveness", "Consecration", "Baptism", "Salvation and Redemption", "Community in Christ", "Mission of the Church", "Church Dedication", "Ordination", "Child Dedication", "Sabbath", "Communion", "Law and Grace", "Spiritual Gifts", "Judgment", "Resurrection of the Saints", "Eternal Life", "Our Love for God", "Joy and Peace", "Hope and Comfort", "Meditation and Prayer", "Faith and Trust", "Guidance", "Thankfulness", "Humility", "Loving Service", "Love for One Another", "Obedience", "Watchfulness", "Christian Warfare", "Pilgrimage", "Stewardship", "Health and Wholeness", "Love of the Country", "Love in the Home", "Marriage"];


//["Worship", "Trinity", "God the Father", "Jesus Christ", "Holy Spirit", "Holy Scriptures", "Gospel", "Christian Church", "Doctrines", "Early Advent", "Christian Life", "Christian Home", "Sentences and Responses"];
var _CATEGORY = [["Adoration and Praise", "Morning Worship", "Evening Worship", "Opening of Worship", "Close of Worship"], [], ["Love of God", "Majesty and Power of God", "Power of God in Nature", "Faithfulness of God", "Grace and Mercy of God"], ["First Advent", "Birth", "Life and Ministry", "Sufferings and Death", "Resurrection and Ascension", "Priesthood", "Love of Christ for Us", "Second Advent", "Kingdom and Reign", "Glory and Praise"], [], [], ["Invitation", "Repentance", "Forgiveness", "Consecration", "Baptism", "Salvation and Redemption"], ["Community in Christ", "Mission of the Church", "Church Dedication", "Ordination", "Child Dedication"], ["Sabbath", "Communion", "Law and Grace", "Spiritual Gifts", "Judgment", "Resurrection of the Saints", "Eternal Life"], [], ["Our Love for God", "Joy and Peace", "Hope and Comfort", "Meditation and Prayer", "Faith and Trust", "Guidance", "Thankfulness", "Humility", "Loving Service", "Love for One Another", "Obedience", "Watchfulness", "Christian Warfare", "Pilgrimage", "Stewardship", "Health and Wholeness", "Love of the Country"], ["Love in the Home", "Marriage"], []];

_CATEGORY[0].name = "Worship";
_CATEGORY[1].name = "Trinity";
_CATEGORY[2].name = "God the Father";
_CATEGORY[3].name = "Jesus Christ";
_CATEGORY[4].name = "Holy Spirit";
_CATEGORY[5].name = "Holy Scriptures";
_CATEGORY[6].name = "Gospel";
_CATEGORY[7].name = "Christian Church";
_CATEGORY[8].name = "Doctrines";
_CATEGORY[9].name = "Early Advent";
_CATEGORY[10].name = "Christian Life";
_CATEGORY[11].name = "Christian Home";
_CATEGORY[12].name = "Sentences and Responses";



_CATEGORY.contains = function (string) {
    return this.map(function (arr) {return arr.name.toLowerCase()}).indexOf(string.toLowerCase());
}

/*SUBCATEGORY.contains = function (string) {
    return (this.map(function (str) {return str.toLowerCase()}).indexOf(string.toLowerCase()) != -1);
}*/

for(var s = 0; s < _CATEGORY.length; s++) {
    _CATEGORY[s].contains = function (string) {
        return this.map(function (str) {return str.toLowerCase()}).indexOf(string.toLowerCase());
    }
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
/*
var last;
var c = new Array();
for(var w = 1; w <= 695; w++) {
    var newone = findCat(w)
    if(newone !== undefined) {
        if(newone != last) {
            c.push(findCat(w));
            last = findCat(w);
        }
    };
}
*/
