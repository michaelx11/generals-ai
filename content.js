
function injectGen(filename, onloadCallback) {
  return function() {
    console.log("injecting: " + filename);
    var s = document.createElement('script');
    s.src = chrome.extension.getURL(filename);
    s.onload = function() {
      onloadCallback();
      this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
  }
}

function injectJavascript() {
  injectGen('utils.js',
      injectGen('generals-ai.js',
        injectGen('generals-interface.js',
          function() {})))();
}

// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    // If the received message has the expected format...
    if (msg.text === 'clicked') {
      injectJavascript();
    }
});
