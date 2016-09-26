// CORE.js //

modeType = new Enum("search", "info", "slide");
var mode = modeType.search;

var category = null;
var subcategory = null;

var minimumRankValue = 30;

var highlighted;
var searchInput = $("#searchinput")[0];

var pageTitle = "Seventh-Day Adventist Hymnal";
$("title")[0].textContent = pageTitle;

// FIRST TIME VISIT //

if(!getLocalStorageKey("first")) {
  showLayerFor($("section#welcomelayer")[0], 2);
  setLocalStorageKey("first", false)
}

//

// LOAD LANGUAGE //
var language;

var localizationStrings = {};

// if(typeof(Storage) !== undefined) {
//     try{
//         if(localStorage.getItem("com.sdahymns.lang") !== null) {
//             language = localStorage.getItem("com.sdahymns.lang");
//         } else {
//             language = "English";
//             localStorage.setItem("com.sdahymns.lang", language);
//         }
//     } catch (e) {
//         console.info("localStorage is unavailable");
//     }
// } else {
//     language = "English";
// }
//
// var hymnal = data;

//               //

// ON URL DATA //
var hymnal;
window.onload = function () {
  var hymnal_id, list ;
  if((list = readFromURL("h")) && (hymnal_id = list[0]) && loadHymnal(hymnal_id)) {
    setLocalStorageKey("hymnal", hymnal_id);
  } else if((hymnal_id = getLocalStorageKey("hymnal")) && loadHymnal(hymnal_id)) {
    overwriteURLKey("h", hymnal_id);
  } else {
    loadHymnal(defaultHymnal)
    setLocalStorageKey("hymnal", defaultHymnal);
    overwriteURLKey("h", defaultHymnal);
  }

  hymnal = data;

  // start hymn
  if(readFromURL("num")) loadHymn(readFromURL("num")[0]);

  // UI
  var dd = $('#set_hymnal')[0]; // drop down
  var op = "";
  for(var id in HYMNAL_DATA) op = op + (op ? ", " : "") + HYMNAL_DATA[id].description + "|" + id;
  dd.setAttribute('options', op);
  dd.childNodes[0].textContent = HYMNAL_DATA[hymnal_id].description;
  dd.onchange = function(new_value) {overwriteURLKey('h', new_value); location.reload()};

  $('#langselect')[0].textContent = language;
}

//             //

// ON SEARCH //

function send(text) {
    var tagActive = false;
    text = text.trimLeft();
    if(text != "") {
        if(text[0] == "#") {
            tagActive = true;
            text = text.slice(1).toLowerCase();
            if(categoryFoundWithName(text)) {
                addSearchTag(officialCategoryName(text));
                $("#searchinput")[0].value = "";
                send("");
            }
            if(subcategoryFoundWithName(text)) {
                addSearchTag(officialSubcategoryName(text));
                $("#searchinput")[0].value = "";
                send("");
            }
        } else {
            refreshResults(hymnal, text);
        }
    } else if(category || subcategory) {
      refreshResults(hymnal, text);
    } else {clearAllResults()}

    $("#searchinput")[0].style.color = ((tagActive) ? "#D0021B" : "black"); //9C5B25
}

function refreshResults(hymnal, text) {
    var results = search(hymnal, text);
    setResults(results);
}


//// Search function returns an array of hymn numbers in order of ranking
function search(hymnal, query) {

    var ranks = new Array();
    for(var i = 0; i < hymnal.length; i++) {
        ranks.push({hymn: hymnal[i], rank: 0});
    }

    if(category !== null) ranks = ranks.filter(isC);
    if(subcategory !== null) ranks = ranks.filter(isS);

    // Similarity Check. 70%
    for(var i = 0; i < ranks.length; i++) {
        var numberRank = (compare(query, ranks[i].hymn.number)) * 0.56;                             // Number:   } Either Or
        var titleRank = (compare(query.toLowerCase().removeDiacritics().removePunctutation(), ranks[i].hymn.name.toLowerCase().removeDiacritics().removePunctutation())) * 0.56; // Title:       } @ 40% of 70% = 56%
        ranks[i].rank += (numberRank > titleRank) ? numberRank : titleRank;
    }
       // Content: 20% (14%)
        // Not computed "on the fly" to save memory

    // Overall Popularity. 20%
    for(var i = 0; i < ranks.length; i++) {
        ranks[i].rank += 32; // To be compiled
    }


    // History. 10%
    var str = getLocalStorageKey("history");
    if(str) {
      var obj = JSON.parse(str)
      if(obj) {
        var list = obj[hymnal_id];
        if(list) {
          var occurences = {};
          for(var j = 0; j < list.length; j++) {
            if(!occurences[list[j]]) occurences[list[j]] = 0;
            occurences[list[j]]++;
          }
          for(var key in occurences) {
            if(ranks[key]) ranks[key].rank += f1(occurences[key]);
          }
        }
      }
    }
    // if(typeof(Storage) !== undefined) {
    //     if(localStorage.getItem("com.sdahymns.history") !== null) {
    //         var rawtext = localStorage.getItem("com.sdahymns.history");
    //         var recent = rawtext.split(" ");
    //         for(var i = 0; i < ranks.length; i++) {
    //             var occurences = 0;
    //             for(var j = 0; j < recent.length; j++) {
    //                 if(ranks[i].hymn.number == recent[j]) occurences++;
    //             }
    //             ranks[i].rank += f1(occurences);
    //         }
    //
    //     }
    // }

    ranks.sort(compareRanks);
    //sortByRank(ranks);

    var maxResults = 5;
    ranks = ranks.slice(0, maxResults);

    return ranks.filter(weakRanks);
}

function compare(str1, str2) {
    var result = 0;

    var averageChars = (str1.length + str2.length) / 2;
    var averageWords = (str1.split(" ").length + str2.split(" ").length) / 2;

    // Exact Matching 40%
    var totalCharactersMatched = 0
    for(var g = 0; g < str1.length; g++) {
        if(str1[g] != str2[g]) break;
        totalCharactersMatched++;
    }
    result += (totalCharactersMatched / averageChars) * 0.4;

    // Word Matching 40%
    var totalWordsMatched = 0;
    var words1 = str1.split(" ").filter(clearemptystrings);
    var words2 = str2.split(" ").filter(clearemptystrings);
    for(var g = 0; g < words1.length; g++) {
        var indexOf = words2.indexOf(words1[g]);
        if(indexOf != -1) {
            words2.splice(indexOf, 1);
            totalWordsMatched++;
        }
    }
    result += (totalWordsMatched / averageWords) * 0.4;

    // Character Matching 20%
    var searcher = (str1.length > str2.length) ? str2 : str1;
    var searched = (str1.length > str2.length) ? str1 : str2;
    var longestLength = searched.length;
    totalCharactersMatched = 0;
    for(var g = 0; g < searcher.length; g++) {
        var indexOf = searched.indexOf(searcher[g]);
        if(indexOf != -1) {
            searched = searched.slice(indexOf + 1);
            totalCharactersMatched++;
        } else {break}
    }
    result += (totalCharactersMatched / longestLength) * 0.2;

    return result * 100;
}

function compareRanks(a, b) {
    return b.rank - a.rank;
}

function isC(elem) {
    return elem.hymn.category == category;
}

function isS(elem) {
    return elem.hymn.subcategory == subcategory;
}

function f1(x) { //computational function
    return new Number(((-8 / (x + (4/5))) + 10).toFixed(2));
}

//           //

// ARRAY FILTERS //

function clearemptystrings(element) {
    return (element != "");
}

function clearwhitespace(element) {
    return (element != " ");
}

function weakRanks(element) {
    return (element.rank > minimumRankValue);
}

//               //

// UI UPDATES //

function addSearchTag(tagName) {
    if(categoryFoundWithName(tagName)) {
        if(category != null) removeSearchTag(category);
        category = tagName;
        if(subcategory != null) if(!categoryHolds(category, subcategory)) removeSearchTag(subcategory);
    }
    if(subcategoryFoundWithName(tagName)) {
        if(subcategory != null) removeSearchTag(subcategory);
        subcategory = tagName;
        if(category != null) if(!categoryHolds(category, subcategory)) removeSearchTag(category);
    }

    var span = ce("span");
    span.className = "searchtag";
    span.textContent = "#" + tagName.toLowerCase();

    var img = ce("img");
    img.src = "resources/images/close.svg";
    img.onclick = function (e) {
        removeSearchTag(this.parentNode.textContent.slice(1));
    }

    span.appendChild(img);
    $("span#tags")[0].appendChild(span);

    refreshResults(hymnal, $("#searchinput")[0].value);
}

function removeSearchTag(tagName) {
    if(categoryFoundWithName(tagName)) type = "category";
    if(subcategoryFoundWithName(tagName)) type = "subcategory";
    switch(type) {
        case "category":
            category =  null;
            break;
        case "subcategory":
            subcategory = null;
            break;
        default:
            console.error("search tag type not found");
    }
    var tagBar = $("span#tags")[0];
    var tagFound = false;
    for(var g = 0; g < tagBar.childNodes.length; g++) {
        if(tagBar.childNodes[g].textContent.slice(1) == tagName.toLowerCase()) {
            tagBar.childNodes[g].remove();
            tagFound = true;
        }
    }
    refreshResults(hymnal, $("#searchinput")[0].value);
    return tagFound;
}

function setResults(results) {
    clearAllResults();
    for(var g = 0; g < results.length; g++) {
        var li = ce("li");
        li.className = "resultslistitem";
        li.onmouseover = function (e) {selectLI(this)}
        li.onmouseout = function (e) {deselectLI(this)}
        li.onclick = function (e) {choose()}

        var sp1 = ce("span");
        sp1.className = "lihymnnumber";
        sp1.textContent = "#" + results[g].hymn.number;
        li.appendChild(sp1);

        var sp2 = ce("span");
        sp2.className = "lihymnname";
        sp2.innerHTML = highlightSimilarities(results[g].hymn.name);//.shorten(26, "..");
        li.appendChild(sp2);

        if(results[g].hymn.subcategory !== undefined) {
            var tag = ce("tag");
            tag.setAttribute("type", "sub");
            tag.setAttribute("fullname", results[g].hymn.subcategory);
            tag.textContent = results[g].hymn.subcategory.smartShorten(16, "..");
            tag.onclick = function (e) {
                addSearchTag(this.getAttribute("fullname"));
                e.stopImmediatePropagation();
            }
            li.appendChild(tag);
        } else {
            var tag = ce("tag");
            tag.setAttribute("type", "super");
            tag.setAttribute("fullname", results[g].hymn.category);
            tag.textContent = results[g].hymn.category.smartShorten(16, "..");
            tag.onclick = function (e) {
                addSearchTag(this.getAttribute("fullname"));
                e.stopImmediatePropagation();
            }
            li.appendChild(tag);
        }

        var img = ce("img");
        img.src = "resources/images/info.svg";
        img.onclick = function (e) {
            createInfobox(this.parentElement.children[0].textContent.slice(1));
            e.stopImmediatePropagation();
        }
        li.appendChild(img);

        if(results[g].rank > 50 && g == 0) selectLI(li);

        $("ul#resultslist")[0].appendChild(li);
    }
}

function clearAllResults() {
    var resultslist = $("ul#resultslist")[0];
    for(var g = 0; g < resultslist.children.length; g) {
        deselectLI(resultslist.children[0]);
        resultslist.removeChild(resultslist.children[0]);
    }
}


function predict() {
    var optionText = childSelected.getElementsByTagName("span")[1].textContent;
    var userInputText = searchInput.value;
    if(userInputText.length != 0) {
        if(userInputText.toLowerCase().removeDiacritics() == optionText.substr(0, userInputText.length).toLowerCase().removeDiacritics()) {
            var newText = userInputText + optionText.substr(userInputText.length);
            setAutocompleteText(newText);
        } else {setAutocompleteText("");}
    }
}

function setAutocompleteText(text) {
    $("#autocomplete")[0].textContent = text;
}

function getAutocompleteText() {
    return $("#autocomplete")[0].textContent;
}

function highlightSimilarities(hymname) {
    var searchText = searchInput.value.toLowerCase().removeDiacritics();
    var c = 0;
    var resultHTML = "";
    for(var i = 0; i < hymname.length; i++) {
        if(hymname[i].toLowerCase().removeDiacritics() == searchText[c]) {
            resultHTML = resultHTML + "<b>" + hymname[i] + "</b>";
            c++;
        } else {
            resultHTML = resultHTML + hymname[i];
        }
    }
    return resultHTML;
}

function showLayer(section) {
    section.style.display = "block";
}

function hideLayer(section) {
    section.style.display = "none";
}

function fadeInLayer(section) {
    showLayer(section);
    section.style.opacity = "0";
    setTimeout(function () {section.style.transitionDuration = "1s"; section.style.opacity = "1";}, 10);
}

function fadeOutLayer(section) {
    section.style.transitionDuration = "1s";
    section.style.opacity = "0";
    setTimeout(function () {hideLayer(section);}, 1000);
}

function showLayerFor(section, seconds) {
    fadeInLayer(section);
    setTimeout(function () {fadeOutLayer(section)}, seconds * 1000);
}

//            //

// SWICTHING THROUGH OPTIONS //
var childSelected;

function selectLI(elem) {
    if(childSelected) deselectLI(childSelected);
    elem.className = elem.className + " hover";
    childSelected = elem;
    predict();
}

function deselectLI(elem) {
    elem.className = elem.className.replace(" hover", "");
    if(childSelected === elem) childSelected = undefined;
    setAutocompleteText("");
}

function movedown() {
    var ul = $("#resultslist")[0];
    var childs = toArray(ul.children);
    var indexOf = childs.indexOf(childSelected);
    if(indexOf != -1) {
        deselectLI(childSelected);
        indexOf++;
        if(ul.children[indexOf]) {
            selectLI(ul.children[indexOf]);
        } else {
            $("#searchinput")[0].focus();
        }
    } else if(childs.length != 0) {
        indexOf = 0;
        selectLI(ul.children[indexOf]);
    }
}

function moveup() {
    var ul = $("#resultslist")[0];
    var childs = toArray(ul.children);
    var indexOf = childs.indexOf(childSelected);
    if(indexOf != -1) {
        deselectLI(childSelected);
        indexOf--;
        if(ul.children[indexOf]) {
            selectLI(ul.children[indexOf]);
        } else {
            setTimeout(function () {$("#searchinput")[0].focus();}, 1);
        }
    } else if(childs.length != 0) {
        indexOf = ul.children.length - 1;
        selectLI(ul.children[indexOf]);
    }
}

//                           //

// KEYBOARD EVENTS //

document.addEventListener("keydown", function (e) {
    var code = e.keyCode;
    if(mode == modeType.search) {
        switch(code) {
            case 13:
                choose();
                break;
            case 38: // up arrow
                $("#searchinput").blur();
                moveup();
                break;
            case 40: // down arrow
                $("#searchinput").blur();
                movedown();
                break;
            default:
                searchInput.focus();
        }
    } else
    if(mode == modeType.slide) {
        switch(code) {
            case 37: // left arrow
                previousSlide();
                break;
            case 39: // right arrow
                nextSlide();
                break;
            case 32: // spacebar
                nextSlide();
                break;
            case 27: // escape key
                quitSlide();
                break;
            case 35: // end key
                quitSlide();
                break;
        }
    }
}, false);

//                 //

// LOADING HYMNS //

function loadHymn(number) {
    var hymn = hymnFromNumber(number);

    if(!hymn) return;
    content = lyricsFromHymn(hymn); // returned in [{number:, title:, note:}, {title:, content:}, {...}] format

    mapOntoMobile(content);

    currentSlide = 1;
    loadSlide(currentSlide);

    mode = modeType.slide;
    addToHistory(hymn.number);
    writeToURL("num", hymn.number);
    // writeToServer(hymn.number, language);
    fadeInLayer($("section#slidelayer")[0]);
}

function hymnFromNumber(num) {
    for(var i = 0; i < hymnal.length; i++) {
        if(hymnal[i].number == num) return hymnal[i];
    }
}

function lyricsFromHymn(hymn) {
    var lyrics = new Array();

    lyrics.push({number: ("#" + hymn.number), name: hymn.name}); //for title slide

    if(hymn.verses) {
        if(hymn.other) lyrics[0].note = hymn.other.toString();
        if(hymn.refrain) {
            if(hymn.refrainFirst) {
                for(var q = 0; q < hymn.verses.length; q++) {
                    lyrics.push({title: "Refrain", content: hymn.refrain});
                    lyrics.push({title: "Verse " + (q + 1), content: hymn.verses[q]});
                }
                if(hymn.last) {
                    lyrics.push({title: "Last Refrain", content: hymn.last});
                } else {
                    lyrics.push({title: "Refrain", content: hymn.refrain});
                }
            } else {
                for(var q = 0; q < hymn.verses.length; q++) {
                    lyrics.push({title: "Verse " + (q + 1), content: hymn.verses[q]});
                    lyrics.push({title: "Refrain", content: hymn.refrain});
                }
                if(hymn.last) {
                    lyrics.lastChild().content = hymn.last;
                }
            }
        } else {
            for(var q = 0; q < hymn.verses.length; q++) {
                lyrics.push({title: "Verse " + (q + 1), content: hymn.verses[q]});
            }
        }
    } else if(hymn.other) {
        if(hymn.refrain) {
            // ...?
            console.log("hymn number " + hymn.number + " contains other and a refrain.. so...");
        } else {
            for(var q = 0; q < hymn.other.length; q++) {
                lyrics.push({title: "", content: hymn.other[q]});
            }
        }
    }

    sud = lyrics

    return lyrics;
}

function mapOntoMobile(content) {
    if(content) {
        var container = $("#mobileslidecenterblock")[0];
        emptyContents(container);

        $("#mobiletitlecontainer h1")[0].textContent = content[0].number + " " + content[0].name; // sets header

        for(var i = 0; i < content.length - 1; i++) {
            var h2 = ce("h2");
            h2.textContent = content[i + 1].title;
            container.appendChild(h2);

            for(var j = 0; j < content[i + 1].content.length; j++) {
                var h3 = ce("h3");
                h3.textContent = content[i + 1].content[j];
                container.appendChild(h3);
            }

        }

        var footer = ce("footer");

        var h4 = ce("h4");
        h4.textContent = ((content.note) ? content[0].note : "");

        footer.appendChild(h4);
        container.appendChild(footer);

    }
}


function loadSlide(number) {
    if(content) {
        emptyContents($("#desktopUI article")[0]);
        emptyContents($("#desktopUI footer")[0]);
        var slide = content[number - 1];
        if(slide.number) { // Title Slide
            var left = ce("div");
            left.id = "lefttitleslide";

            var num = ce("h1");
            num.textContent = slide.number;

            var right = ce("div");
            right.id = "righttitleslide";

            var nam = ce("h1");
            nam.textContent = slide.name;

            left.appendChild(num);
            right.appendChild(nam);
            $("#desktopUI article")[0].appendChild(left);
            $("#desktopUI article")[0].appendChild(right);
        } else { // Normal Slide
            var container = ce("div");
            container.id = "wordsnormalslide";

            var heading = ce("h2");
            heading.textContent = slide.title;
            container.appendChild(heading);

            for(var i = 0; i < slide.content.length; i++) {
                var line = ce("h3");
                line.textContent = slide.content[i];
                container.appendChild(line);
            }

            if(content[0].note) {
                var h4 = ce("h4");
                h4.textContent = content.note;
                $("#desktopUI footer")[0].appendChild(h4);
            }
            $("#desktopUI article")[0].appendChild(container);
        }

        // Setup for navigation
        var nav = $("#slideNavigation")[0];
        if(nav.children.length != content.length) {
            emptyContents(nav);
            for(var i = 0; i < content.length; i++) {
                var span = ce("span");
                span.className = "slideNumber";
                if(!(i < 9)) span.className = "slideNumber large";
                span.textContent = i + 1;
                span.onclick = function () {
                    currentSlide = this.textContent;
                    loadSlide(this.textContent);
                }
                nav.appendChild(span);
            }
        }
        for(var i = 0; i < nav.children.length; i++) {
            if(nav.children[i].textContent == number) {
                nav.children[i].setAttribute("current", "true");
            } else {
                nav.children[i].removeAttribute("current");
            }
        }
        nav.className = ((content.length == number) ? "last" : "");
    }
}

function nextSlide() {
    if(++currentSlide > content.length) currentSlide--;
    loadSlide(currentSlide);
}

function previousSlide() {
    if(--currentSlide <= 0) currentSlide++;
    loadSlide(currentSlide);
}

function quitSlide() {
    resetSlideNavigation();
    mode = modeType.search;
    fadeOutLayer($("section#slidelayer")[0]);
    clearURL();
    searchInput.focus();
    searchInput.select();
}

function resetSlideNavigation() {
    emptyContents($("#slideNavigation")[0]);
}


function choose() { // chooses the selected hymn and prepares to load it
    if(childSelected) {
        searchInput.value = childSelected.children[1].textContent;
        searchInput.blur();
        loadHymn(childSelected.children[0].textContent.slice(1));
        clearAllResults();
    }
}

//               //

// CLASS EXTENSIONS //
// STRING

String.prototype.shorten = function (maxLength, ending) {
    ending = ((arguments.length >= 2) ? ending : "...");
    if(arguments.length == 0) {
        console.error("\"maxLength\" is needed to perform this operation");
    } else {
        if(this.length <= maxLength) {
            return this;
        } else {
            var finalstring = "";
            var wordCount = 0;
            while(true) {
                var test = finalstring + " " + this.split(" ").filter(clearemptystrings)[wordCount++];
                if(test.length > (maxLength - ending.length)) break;
                finalstring = test.trim();
            }
            return (finalstring + ending);
        }
    }
}

String.prototype.smartShorten = function (maxLength, ending) {
    ending = ((arguments.length >= 2) ? ending : "...");
    if(arguments.length == 0) {
        console.error("\"maxLength\" is needed to perform this operation");
    } else {
        if(this.length <= maxLength) {
            return this;
        } else {
            var finalstring = "";
            var wordCount = 0;
            while(true) {
                var test = finalstring + " " + this.split(" ").filter(clearemptystrings)[wordCount++];
                if(test.length > (maxLength - ending.length)) break;
                finalstring = test.trim();
            }
            while(true) {
                if(!(finalstring.split(" ").lastChild().charCodeAt(0) > 64 && finalstring.split(" ").lastChild().charCodeAt(0) < 91)) {
                    finalstring = finalstring.replace(finalstring.split(" ").lastChild(), "").trim();
                } else {
                    break;
                }
            }
            return (finalstring + ending);
        }


    }
}

// GENERIC

var emptyContents = function (element) {
    for(var q = 0; q != element.children.length; q) {
        element.removeChild(element.children[0]);
    }
}


//                  //

// POPUP WINDOW //

setupPopups();

function setupPopups() {
    var popups = $(".popup");
    for(var i = 0; i < popups.length; i++) {
        popups[i].toggle = function () {(this.getAttribute("active") == "true") ? this.hide() : this.show()}
        popups[i].show = function () {this.setAttribute("active", "true")}
        popups[i].hide = function () {this.setAttribute("active", "false")}
        popups[i].onclick = function (e) {e.stopImmediatePropagation();}
    }
}

function hideAllPopups() {
    var popups = $(".popup");
    for(var i = 0; i < popups.length; i++) {
        popups[i].hide();
    }
}


//              //

// MOUSE EVENTS //

document.addEventListener("click", function(e) {
    hideAllPopups();
}, false);


//              //

// HISTORY MANAGEMENT //

function addToHistory(number) {
  var historyKey = "history";
  var stored = JSON.parse(getLocalStorageKey(historyKey) || "{}");
  var list = stored[hymnal_id] = stored[hymnal_id] || [];
  list.push(number);
  setLocalStorageKey(historyKey, JSON.stringify(stored))

    // if(typeof(Storage) !== undefined) {
    //     try{
    //         if(localStorage.getItem(historyKey) == null) localStorage.setItem(historyKey, "");
    //         var str = localStorage.getItem(historyKey) + " " + number;
    //         localStorage.setItem(historyKey, str.trim());
    //     } catch (e) {
    //         console.info("localStorage is unavailable");
    //     }
    // }
}

function cleanupHistory(max) {
    if(typeof(Storage) !== undefined) {

        var maxHistoryLength = (max) ? max : 100;

        if(localStorage.getItem("com.sdahymns.history") !== null) {
            var rawtext = localStorage.getItem("com.sdahymns.history");
            var recent = rawtext.split(" ");
            if(recent.length > maxHistoryLength) {
                recent.splice(recent.length - maxHistoryLength);
                var str = "";
                for(var g = 0; g < recent.length; g++) {
                    str = str + " " + number;
                }
                localStorage.setItem("com.sdahymns.history", str.trim());
            }
        }
    }
}

function clearHistory() {
    localStorage.removeItem("history");
}

function reset() {
    localStorage.removeItem("history");
    localStorage.removeItem("hymnal");
    localStorage.removeItem("first");
}

//                    //

// SERVER //

function writeToServer(number, lang) {
    var xmlhttp=new XMLHttpRequest();
    xmlhttp.open("GET", "writepop.php?num="+number+"&lang="+lang,true);
    xmlhttp.send();
}


//        //

// INFOBOXES //

var boxTop = 196;
var boxLeft = 614;

function createInfobox(number) {
    var hymn = hymnFromNumber(number);

    var box = ce("div");
    box.className = "infobox";
    box.onclick = function (e) {e.stopImmediatePropagation()}

    var header = ce("header");

    var title = ce("span");
    title.className = "infoboxTitle";
    title.textContent = hymn.name;

    var num = ce("span");
    num.className = "infoboxNumber";
    num.textContent = "#" + hymn.number;

    var article = ce("article");

    var table = ce("table");

    var categoryRow = ce("tr");
    var Cword = ce("td");
    Cword.textContent = "Main Category:";
    var Cdef = ce("td");
    Cdef.appendChild(newCTag(hymn));

    var subcategoryRow = ce("tr");
    var Sword = ce("td");
    Sword.textContent = "Sub Category:";
    var Sdef = ce("td");
    Sdef.appendChild(newSTag(hymn));

    var footer = ce("footer");
    var close = ce("button");
    close.textContent = "Close";
    close.onclick = function (e) {
        this.parentElement.parentElement.parentElement.removeChild(this.parentElement.parentElement);
    }

    header.appendChild(title);
    header.appendChild(num);

    categoryRow.appendChild(Cword);
    categoryRow.appendChild(Cdef);
    subcategoryRow.appendChild(Sword);
    subcategoryRow.appendChild(Sdef);
    table.appendChild(categoryRow);
    table.appendChild(subcategoryRow);
    article.appendChild(table);

    footer.appendChild(close);

    box.appendChild(header);
    box.appendChild(article);
    box.appendChild(footer);

    box.style.top = returnAndShift(boxTop) + "px";
    box.style.left = returnAndShift(boxLeft) + "px";

    $("#searchlayer")[0].appendChild(box);
    $(".infobox").draggable({ containment: "#containment-wrapper", scroll: false });
}

function returnAndShift(parameter) {
    if(parameter === boxTop) {
        var old = boxTop;
        boxTop += 40;
        if(boxTop > 400) {boxTop -= 200}
        return old;
    } else if(parameter === boxLeft) {
        var old = boxLeft;
        boxLeft += 10;
        if(boxTop > 400) {boxLeft += 100}
        return old;
    } else {
        console.error("returnAndShift received wrong parameter")
    }
}

function newCTag(hymn) {
    var tag = ce("tag");
    tag.setAttribute("type", "cat");
    tag.textContent = hymn.category;
    tag.onclick = function (e) {
        addSearchTag(this.textContent);
    }
    return tag;
}

function newSTag(hymn) {
    if(hymn.subcategory) {
        var tag = ce("tag");
        tag.setAttribute("type", "sub");
        tag.textContent = hymn.subcategory;
        tag.onclick = function (e) {
            addSearchTag(this.textContent);
        }
    } else {
        var tag = ce("tag");
        tag.setAttribute("disabled", "");
        tag.textContent = "N/A";
    }
    return tag;
}

//           //

// URL DATA //

function writeToURL(key, value) {
    var title = (key == "num") ? "SDA Hymn " + value : pageTitle;

    // reads url params, and adds coresponding key+value
    var present_parameters = parseURLParams(window.location.toString()) || {};
    var values_for_key = present_parameters[key] = present_parameters[key] || [];
    values_for_key.push(value);

    // sets a new history with updated params
    var url_str = "";
    for(var key in present_parameters) {
      for(let value of present_parameters[key]) {
        url_str = url_str + (url_str ? "&" : "") + key + "=" + value
      }
    }
    url_str = "?" + url_str
    window.history.pushState({}, titleFromURL(present_parameters), url_str);
}

function readFromURL(key) {
    var parameters = parseURLParams(window.location.toString());
    if(parameters) return parameters[key];
}

// from https://stackoverflow.com/questions/814613/
function parseURLParams(url) {
    var queryStart = url.indexOf("?") + 1,
        queryEnd   = url.indexOf("#") + 1 || url.length + 1,
        query = url.slice(queryStart, queryEnd - 1),
        pairs = query.replace(/\+/g, " ").split("&"),
        parms = {}, i, n, v, nv;

    if (query === url || query === "") {
        return;
    }

    for (i = 0; i < pairs.length; i++) {
        nv = pairs[i].split("=");
        n = decodeURIComponent(nv[0]);
        v = decodeURIComponent(nv[1]);

        if (!parms.hasOwnProperty(n)) {
            parms[n] = [];
        }

        parms[n].push(nv.length === 2 ? v : null);
    }
    return parms;
}

function clearURL() {
    window.history.pushState({}, pageTitle, location.pathname);
}

function clearURLKey(key) {
  var present_parameters = parseURLParams(window.location.toString());
  if(!present_parameters) return;

  // the remove part
  delete present_parameters[key];

  var url_str = "?";
  for(var key in present_parameters) {
    for(let value of present_parameters[key]) {
      url_str = url_str + key + "=" + value + "&"
    }
  }
  window.history.pushState({}, titleFromURL(present_parameters), url_str);
}

function titleFromURL(present_parameters) {
  if(!present_parameters) present_parameters = parseURLParams(window.location.toString()) || {};
  return (present_parameters["num"]) ? "SDA Hymn " + present_parameters["num"][0] : pageTitle
}

function overwriteURLKey(key, value) {
  clearURLKey(key);
  writeToURL(key, value);
}


//          //

// LOCALSTORAGE DATA //

function getLocalStorageKey(key) {
  if(localStorageAvailable()) {
    try{
      return localStorage.getItem(key) || undefined
    } catch (e) {
      console.info("localStorage get unavailable");
    }
  }
}
function setLocalStorageKey(key, value) {
  if(localStorageAvailable()) {
    try{
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.info("localStorage set unavailable");
      return false;
    }
  }
}

function localStorageAvailable() {
  return typeof(Storage) !== undefined;
}

//                   //

// INFOPAGES //

function loadInfopage(name) {

    switch(name) {
        case "feedback":


        case "about":


        case "resources":


        default:
            console.log("infopage not found");
    }

}


//           //

// OTHER USEFUL FUNCTIONALITY //

var toArray = function(obj) {
  return [].map.call(obj, function(element) {
    return element;
  })
};

function Enum(){
    for( var i = 0; i < arguments.length; ++i ){
        this[arguments[i]] = i;
    }
    return this;
}

searchInput.focusEnd = function () {
    this.focus();
    var length = this.value.length * 2;
    this.setSelectionRange(length, length);
}

//                            //
