document.addEventListener("DOMContentLoaded", initPopup, false);
let normalBox = null;
let targetedBox = null;

// init the tooltips (when hovering over the add buttons)
$(function () {
  $('[data-toggle="tooltip"]').tooltip();
});

// same as the one in content.js...I couldn't figure out how to import the method
function normalize(url) {
  // take out https://
  if (url.indexOf("https://") == 0) {
    url = url.substring(8);
  }
  // take out www.
  if (url.indexOf("www.") == 0) {
    url = url.substring(4);
  }
  // take out slash at end
  if (url.charAt(url.length - 1) === '/') {
    url = url.substring(0, url.length - 1);
  }

  return url;
}

// add empty lists to chrome storage sync if variables don't exist yet
chrome.storage.sync.get("blockedList", function (result) {
  if (result.blockedList === undefined) {
    chrome.storage.sync.set({ blockedList: [] });
  }
});

chrome.storage.sync.get("targetedBlockedList", function (result) {
  if (result.targetedBlockedList === undefined) {
    chrome.storage.sync.set({ targetedBlockedList: [] });
  }
});


function initPopup() {
  document
    .getElementById("plus_button_blacklist")
    .addEventListener("click", function () {
      addInput("normal");
    });

  document
    .getElementById("plus_button_targeted_blacklist")
    .addEventListener("click", function () {
      addInput("targeted");
    });

  // take all URLs from synced storage and put them on the popup
  chrome.storage.sync.get("blockedList", function (result) {
    let masterList = [];
    if (typeof result.blockedList !== "undefined") {
      masterList = result.blockedList;
    }
    for (let i = 0; i < masterList.length; i++) {
      let websiteName = masterList[i];
      addStaticElement(websiteName, "normal");
    }
  });

  // take all targetd URLs from synced storage and put them on the popup
  chrome.storage.sync.get("targetedBlockedList", function (result) {
    let masterList2 = [];
    if (typeof result.targetedBlockedList !== "undefined") {
      masterList2 = result.targetedBlockedList;
    }
    for (let i = 0; i < masterList2.length; i++) {
      let websiteName = masterList2[i];
      addStaticElement(websiteName, "targeted");
    }
  });
}

// the "+" button
function addInput(type) {
  // alert("+");
  let inputList = "default";
  if (type === "normal") {
    inputList = document.getElementById("input_list");
    if (normalBox) {
      normalBox.focus();
      return;
    }
  } else if (type === "targeted") {
    inputList = document.getElementById("input_list_targeted");
    if (targetedBox) {
      targetedBox.focus();
      return;
    }
  }

  let inputNode = document.createElement("div");

  let newChild = document.createElement("input");
  newChild.type = "text";
  newChild.style.marginTop = "5px";
  newChild.style.marginBottom = "5px";
  inputNode.appendChild(newChild);
  if (type === "normal") {
    normalBox = newChild;
  } else {
    targetedBox = newChild;
  }

  let newButton = document.createElement("button");
  newButton.type = "button";
  newButton.innerHTML = "Confirm";
  newButton.style.marginLeft = "10px";
  newButton.classList.add("btn", "btn-primary");
  
  if (type === "normal") {
    newButton.onclick = function () {
      confirmURL(inputNode, "normal");
    };
  } else if (type === "targeted") {
    newButton.onclick = function () {
      confirmURL(inputNode, "targeted");
    };
  }

  

  // Execute a function when the user releases a key on the keyboard
  newChild.addEventListener("keyup", function (event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.key === "Enter") {
      // Cancel the default action, if needed
      event.preventDefault();
      // Trigger the button element with a click
      newButton.click();
    }
  });

  inputNode.appendChild(newButton);

  inputList.appendChild(inputNode);

  // make cursor go to now input box
  newChild.focus();
}

// returns true if the text matches anything in the inputList, false otherwise
function checkMatches(text, inputList) {
  for (const elt of inputList.childNodes) {
    if (elt.nodeName === "DIV" && normalize(elt.firstChild.innerHTML) === normalize(text)) {
      return true;
    }
  }
  return false;
}

// the "Confirm" button
function confirmURL(inputNode, type) {
  let inputBox = inputNode.firstChild;
  let inputList = inputNode.parentNode;

  // get text of input box (but remove whitespace with regex)
  let text = inputBox.value.replace(/\s+/g, '')

  // make sure we don't match anything already in our inputList
  if (checkMatches(text, inputList)) {
    inputBox.focus();
    return;
  }

  // make sure the inputBox actually contains some characters; else return
  if (text.length == 0) {
    return;
  }
  
  inputList.removeChild(inputNode);

  addStaticElement(text, type);

  if (type === "normal") {
    normalBox = null;
    chrome.storage.sync.get("blockedList", function (result) {
      let masterList = [];
      if (typeof result.blockedList !== "undefined") {
        masterList = result.blockedList;
      }

      // add our new value to masterList
      masterList.push(text);

      // replace the old key with our new key
      chrome.storage.sync.set({ blockedList: masterList });
    });
  } else if (type === "targeted") {
    targetedBox = null;
    chrome.storage.sync.get("targetedBlockedList", function (result) {
      let masterList2 = [];
      if (typeof result.targetedBlockedList !== "undefined") {
        masterList2 = result.targetedBlockedList;
      }

      // add our new value to masterList
      masterList2.push(text);

      // replace the old key with our new key
      chrome.storage.sync.set({ targetedBlockedList: masterList2 });
    });
  }
}

function addStaticElement(text, type) {
  let inputList = "default";
  if (type === "normal") {
    inputList = document.getElementById("input_list");
  } else if (type === "targeted") {
    inputList = document.getElementById("input_list_targeted");
  }

  let listNode = document.createElement("div");

  let blockedWebsite = document.createElement("span");
  blockedWebsite.innerHTML = text;
  listNode.appendChild(blockedWebsite);

  let deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.innerHTML = "Delete";
  deleteButton.onclick = function () {
    removeWebsite(listNode, type);
  };
  deleteButton.style.marginLeft = "10px";
  deleteButton.style.marginTop = "2px";
  deleteButton.style.marginBottom = "2px";
  deleteButton.classList.add("btn", "btn-danger");

  listNode.appendChild(deleteButton);

  inputList.appendChild(listNode);
}

function removeWebsite(listNode, type) {
  let inputList = listNode.parentNode;
  inputList.removeChild(listNode);

  let children = listNode.children;
  let websiteName;
  for (let i = 0; i < children.length; i++) {
    if (children[i] instanceof HTMLSpanElement) {
      websiteName = children[i].innerHTML;
    }
  }

  if (type === "normal") {
    chrome.storage.sync.get("blockedList", function (result) {
      let masterList = [];
      if (typeof result.blockedList !== "undefined") {
        masterList = result.blockedList;
      }

      // update masterList
      masterList = masterList.filter((e) => e != websiteName);

      // replace the old value with our new value
      chrome.storage.sync.set({ blockedList: masterList });
    });
  } else if (type === "targeted") {
    chrome.storage.sync.get("targetedBlockedList", function (result) {
      let masterList2 = [];
      if (typeof result.targetedBlockedList !== "undefined") {
        masterList2 = result.targetedBlockedList;
      }

      // update masterList
      masterList2 = masterList2.filter((e) => e != websiteName);

      // replace the old value with our new value
      chrome.storage.sync.set({ targetedBlockedList: masterList2 });
    });
  }
}
