// Game state object is used by the AI engine
var gameState = {}

//                   Overall System Design
//
// --------------                           ------------------
// |DOM elements|--> populateGameState() -->|gameState Object|
// --------------                           ------------------
//        ^                                  |      |      |
//        |                                  v      |      v
//        |                              gameMap    |   Opponent Info
// -------------------------                 |      v      |
// |ReactJS event injection|                 |Game Ticks   |
// -------------------------                 V      V      V
//        |                          --------------------------
//        |                          |     AI Engine Logic    |
//        |                          --------------------------
//        |                                      |
//        |                                      v
// ----------------                  --------------------------
// |   makeMove   |<-----------------|Game Engine Movement API|
// ----------------                  --------------------------

// == Game State Methods ==
function getOurGeneralTile() {
  console.log("getting general tile!");
  var tileList = gameState.tileList;
  if (!tileList) {
    console.log("tile list undefined");
    return null;
  }

  for (var i = 0; i < tileList.length; i++) {
    var tileObj = tileList[i];
    console.log(tileObj);
    if (tileObj.desc.search(/selectable.*general/gi) >= 0) {
      return tileObj;
    }
  }
  console.log("didn't find a tile!");
  return null;
}

// == AI Engine Methods ==

// == Public Action Helpers for AI Engine ==
function performMove(startRow, startCol, direction, shouldSplit) {
  console.log("performing move!");
  // Set mouseup coords
  GLOBAL_COORDS = { row: startRow, col: startCol };
  // mouseup in origin square
  GLOBAL_GAME_MAP.onMouseUp()
  // if split, do it again
  if (shouldSplit) {
    GLOBAL_GAME_MAP.onMouseUp()
  }
  // Fake arrow key move
  GLOBAL_KEY_DIR = direction;
  // Trigger fake keydown event
  GLOBAL_GAME_MAP.onKeyDown();
}

// Checks:
// - GLOBAL_GAME_MAP
// for existence
function checkGlobalSymbols() {
  return (typeof GLOBAL_GAME_MAP !== 'undefined' && GLOBAL_GAME_MAP != null);
}

function populateGameState() {
  gameMap = document.getElementById("map").children[0];
  gameState = {}
  gameState.numRows = gameMap.childElementCount;
  gameState.numCols = gameMap.children[0].childElementCount;
  gameState.rows = [];
  gameState.tileList = [];
  for (var i = 0; i < gameState.numRows; i++) {
    var row = [];
    var currentTR = gameMap.children[i];
    for (var u = 0; u < gameState.numCols; u++) {
      var currentTile = currentTR.children[u];
      var tileObj = {};
      tileObj.desc = currentTile.className;
      tileObj.text = currentTile.innerText;
      tileObj.row = i;
      tileObj.col = u;
      // keep in formation
      row.push(tileObj);
      // keep general list for quick search
      gameState.tileList.push(tileObj);
    }
    gameState.rows.push(row);
  }

  console.log("r: " + gameState.numRows + " c: " + gameState.numCols);
}

function makeMoveFromCapitalToLeft() {
  var generalTile = getOurGeneralTile();
  if (!generalTile) {
    return;
  }
  console.log(generalTile);
  // Make a move left
  performMove(generalTile.row, generalTile.col, 0);
}

// Main

console.log("LOADED!");
populateGameState();
makeMoveFromCapitalToLeft();
