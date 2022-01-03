// html for the emoji
function generateHTML() {
  let emojis = [
    `¯\\_(ツ)_/¯`,
    `(ㆆ _ ㆆ)`,
    `/|\\ ^._.^ /|\\`,
    `ʕっ•ᴥ•ʔっ`,
    `(˵ ͡° ͜ʖ ͡°˵)`,
    `(= ФェФ=)`,
    `	( ͡° ᴥ ͡°)`,
    `(｡◕‿‿◕｡)`,
    `	d[-_-]b`,
    `	<(^_^)>`,
    `(̿▀̿ ̿Ĺ̯̿̿▀̿ ̿)̄ `,
    `	(҂◡_◡) ᕤ `,
    `	| (• ◡•)|`,
  ];
  let selectedEmoji = emojis[Math.floor(Math.random() * emojis.length)];
  return `<h1 class="big-middle"> ${selectedEmoji} </h1>`;
}

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

function blockHostname() {
  for (let i = 0; i < blackList.length; i++) {
    if (normalize(blackList[i]) === normalize(window.location.hostname)) {
      document.head.innerHTML = generateStyling();
      document.body.innerHTML = generateHTML();
    }
  }
  // if (blackList.includes(hostname)) {
  //   document.head.innerHTML = generateStyling();
  //   document.body.innerHTML = generateHTML();
  // }
}

function blockHref() {
  for (let i = 0; i < targetedBlackList.length; i++) {
    if (normalize(targetedBlackList[i]) === normalize(window.location.href)) {
      document.head.innerHTML = generateStyling();
      document.body.innerHTML = generateHTML();
    }
  }

  // if (targetedBlackList.includes(window.location.href)) {
  //   document.head.innerHTML = generateStyling();
  //   document.body.innerHTML = generateHTML();
  // }
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
let intervalId = window.setInterval(function () {
  blockHostname();
  blockHref();
}, 500);
