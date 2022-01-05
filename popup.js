document.addEventListener("DOMContentLoaded", initPopup, false);

// init the tooltips (when hovering over the add buttons)
$(function () {
  $('[data-toggle="tooltip"]').tooltip();
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
  } else if (type === "targeted") {
    inputList = document.getElementById("input_list_targeted");
  }

  let inputNode = document.createElement("div");

  let newChild = document.createElement("input");
  newChild.type = "text";
  newChild.style.marginTop = "5px";
  newChild.style.marginBottom = "5px";
  inputNode.appendChild(newChild);

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
}

// the "Confirm" button
function confirmURL(inputNode, type) {
  let inputBox = inputNode.firstChild;
  let inputList = inputNode.parentNode;

  // make sure the inputBox actually contains some characters; else return
  if (inputBox.value.trim().length == 0) {
    return;
  }

  // alert("confirm");
  
  inputList.removeChild(inputNode);

  addStaticElement(inputBox.value, type);

  if (type === "normal") {
    chrome.storage.sync.get("blockedList", function (result) {
      let masterList = [];
      if (typeof result.blockedList !== "undefined") {
        masterList = result.blockedList;
      }

      // add our new value to masterList
      masterList.push(inputBox.value);

      // replace the old key with our new key
      chrome.storage.sync.set({ blockedList: masterList });
    });
  } else if (type === "targeted") {
    chrome.storage.sync.get("targetedBlockedList", function (result) {
      let masterList2 = [];
      if (typeof result.targetedBlockedList !== "undefined") {
        masterList2 = result.targetedBlockedList;
      }

      // add our new value to masterList
      masterList2.push(inputBox.value);

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
