// html for the emoji
function generateHTML() {
  let strings = [
    `<h1 class="big-middle"> ¯\\_(ツ)_/¯ </h1>`,
    `<h1 class="big-middle"> (ㆆ _ ㆆ) </h1>`,
    `<h1 class="big-middle"> /|\\ ^._.^ /|\\ </h1>`,
    `<h1 class="big-middle"> ʕっ•ᴥ•ʔっ </h1>`,
    `<h1 class="big-middle"> 	(˵ ͡° ͜ʖ ͡°˵) </h1>`,
    `<h1 class="big-middle"> (= ФェФ=) </h1>`,
    `<h1 class="big-middle"> 	( ͡° ᴥ ͡°) </h1>`,
    `<h1 class="big-middle"> (｡◕‿‿◕｡) </h1>`,
    `<h1 class="big-middle"> 	d[-_-]b </h1>`,
    `<h1 class="big-middle"> 	<(^_^)> </h1>`,
    `<h1 class="big-middle"> (̿▀̿ ̿Ĺ̯̿̿▀̿ ̿)̄ </h1>`,
    `<h1 class="big-middle"> 	(҂◡_◡) ᕤ </h1>`,
    `<h1 class="big-middle"> 	| (• ◡•)| </h1>`,
  ];
  let string = strings[Math.floor(Math.random() * strings.length)];
  return string;
}

function blockHostname() {
  let hostname = window.location.hostname;
  if (hostname.indexOf("www.") == 0) {
    hostname = hostname.substring(4);
  }

  if (blackList.includes(hostname)) {
    document.head.innerHTML = generateStyling();
    document.body.innerHTML = generateHTML();
  }
}

function blockHref() {
  if (targetedBlackList.includes(window.location.href)) {
    document.head.innerHTML = generateStyling();
    document.body.innerHTML = generateHTML();
  }
}

// html for the styling
function generateStyling() {
  let string = `
    <style>
    .big-middle {
        text-align: center;
        font-size: 80px;
    }
    </style>
    `;
  return string;
}

// window.location.hostname is the bare bones URL
// window.location.href is the extended url

// let blackList = ["lichess.org", "www.chess.com", "chesstempo.com", "www.facebook.com"]; // for blocking entire websites
let blackList = [];
chrome.storage.sync.get("blockedList", function (result) {
  blackList = result.blockedList;
});

// let targetedBlackList = ["https://www.instagram.com/"]; // for only blocking specific URLs
let targetedBlackList = [];
chrome.storage.sync.get("targetedBlockedList", function (result) {
  targetedBlackList = result.targetedBlockedList;
});

// block sites every 500 milliseconds
var intervalId = window.setInterval(function () {
  blockHostname();
  blockHref();
}, 500);
