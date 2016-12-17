var gameMap = null;
var numRows = -1;
var numCols = -1;

function populateGameMapElement() {
  gameMap = document.getElementById("map").children[0];
  numRows = gameMap.childElementCount;
  numCols = gameMap.children[0].childElementCount;

  console.log("r: " + numRows + " c: " + numCols);
}

// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    // If the received message has the expected format...
    if (msg.text === 'clicked') {
      populateGameMapElement();
    }
});
