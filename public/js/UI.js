    ///////////////
   //           //
  //   UI.js   //
   //           //
    ///////////////


/// // SETUP UI ELEMENTS // ///

// SETUP DROP DOWN MENUES //
var NumOfDDMs = 0;

setDDMs();

function setDDMs() {
    var DDMs = $(".UI_DROP");
    for(var g = 0; g < DDMs.length; g++) {
        var DDM = DDMs[g];
        DDM.refid = "UI_DROP_" + ++NumOfDDMs;
        var value = DDM.innerHTML;
        DDM.innerHTML = "";
        var sp1 = ce("span");
        sp1.id = DDM.refid + "_CONTENT";
        sp1.className = "UI_DROP_CONTENT";
        sp1.textContent = value;
        var sp2 = ce("span");
        sp2.className = "UI_DROP_DIVIDER";
        var img = ce("img");
        img.className = "UI_DROP_ARROWS";
        img.src = "resources/images/arrows.svg";

        DDM.appendChild(sp1);
        DDM.appendChild(sp2);
        DDM.appendChild(img);

        DDM.onclick = function (e) {
            removeUIDrop();
            UIDrop(this);
            e.stopPropagation();
        }
    }
}

function UIDrop(DDB) {
    var offset = 0.2; //em
    var items = DDB.attributes.getNamedItem("options").textContent.split(", ");

    var box = ce("span");
    box.className = "UI_DROP_BOX";
    box.style.top = "calc(" + DDB.offsetTop + "px - " + offset + "em)";
    box.style.left = "calc(" + DDB.offsetLeft + "px - " + offset + "em)";

    for(var g = 0; g < items.length; g++) {
        var parts = items[g].split("|");
        var item = ce("span");
        item.className = "UI_DROP_BOX_LI";
        item.textContent = parts[0];
        item.value = parts[1];

        if(items[g] == DDB.textContent) item.style.fontWeight = "bold";
        item.onclick = function(e) {
            var DDB = this.parentNode.parentNode;
            var value = DDB.value = this.value;
            document.getElementById(DDB.refid + "_CONTENT").textContent = this.textContent;
            removeUIDrop();
            try {DDB.onchange(value);} catch(e) {}
            e.stopPropagation();
        }
        box.appendChild(item);
    }

    DDB.appendChild(box);
}

function removeUIDrop() {
    var allBoxes = $(".UI_DROP_BOX");
    for(var g = 0; g < allBoxes.length; g++) {
        allBoxes[0].remove();
    }
}


// GLOBAL EVENT LISTENERS //

document.addEventListener("click", function(e) {
    removeUIDrop();
}, false);


/////////
function ce(name) {
    return document.createElement(name);
}
