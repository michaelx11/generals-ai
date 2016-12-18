function injectGameAI() {
  console.log("injecting game UI");
  var s = document.createElement('script');
  s.src = chrome.extension.getURL('generals-ai.js');
  s.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(s);
}

// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    // If the received message has the expected format...
    if (msg.text === 'clicked') {
      injectGameAI();
    }
});
