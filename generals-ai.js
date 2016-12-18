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

var logger = {};
var DEBUG_LEVEL = 6;
logger.trace = function(str) {
  if (DEBUG_LEVEL >= 6) {
    console.log(str);
  }
}

logger.debug = function(str) {
  if (DEBUG_LEVEL >= 5) {
    console.log(str);
  }
}

logger.info = function(str) {
  if (DEBUG_LEVEL >= 4) {
    console.log(str);
  }
}

// == Core game AI ==
var globalTurnCounter = 0; // we only process once per tick
function processGameState(gameState) {
  // do nothing
  if (gameState.turnCounter <= globalTurnCounter) {
    return;
  }

  logger.trace(gameState);

  globalTurnCounter = gameState.turnCounter;
  makeMoveFromCapitalToLeft(gameState);
}


function makeMoveFromCapitalToLeft(gameState) {
  var generalTile = getOurGeneralTile(gameState);
  if (!generalTile) {
    return;
  }
  logger.trace(generalTile);
  // Make a move left
  performMove(generalTile.row, generalTile.col, 0, true);
}


function retrieveRandomTile() {

}

function makeRandomMove() {
}

// == Game State Methods ==

function filterTilesForDesc(gameState, regex) {
  var tileList = gameState.tileList;
  if (!tileList) {
    return null;
  }

  var filtered = [];
  for (var i = 0; i < tileList.length; i++) {
    var tileObj = tileList[i];
    if (tileObj.desc.search(regex) >= 0) {
      filtered.push(tileObj);
    }
  }

  return filtered;
}

function getOurTiles(gameState) {
}

function getOurGeneralTile(gameState) {
  var generalTiles = filterTilesForDesc(gameState, /selectable.*general/gi);
  if (generalTiles.length != 1) {
    return null;
  }
  return generalTiles[0];
}

// == AI Engine Methods ==

var ARROW_KEY_CODES = [37, 38, 39, 40];
// == Public Action Helpers for AI Engine ==
function performMove(startRow, startCol, direction, shouldSplit) {
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
  var keyEvent = {keyCode: ARROW_KEY_CODES[direction]}
  // stubs
  keyEvent.preventDefault = function() {};
  keyEvent.stopPropagation = function() {};
  // Trigger fake keydown event
  GLOBAL_GAME_MAP.onKeyDown(keyEvent);
  // Deselect afterwards
  keyEvent.keyCode = 32; // Space
  GLOBAL_GAME_MAP.onKeyDown(keyEvent);
}

// Checks:
// - GLOBAL_GAME_MAP
// for existence
function checkGlobalSymbols() {
  return (typeof GLOBAL_GAME_MAP !== 'undefined' && GLOBAL_GAME_MAP != null);
}

// NOTE: username currently hardcoded ...
function parseGameLeaderboard(gameState, ourUsername) {
  var leaderboardElement = document.getElementById("game-leaderboard").children[0];
  var leaderboard = [];
  for (var i = 1; i < leaderboardElement.childElementCount; i++) {
    var leaderboardRow = leaderboardElement.children[i];
    var nameElement = leaderboardRow.children[1];
    var armyElement = leaderboardRow.children[2];
    var landElement = leaderboardRow.children[3];

    var color = nameElement.className.split(" ").pop();
    var username = nameElement.innerText;
    var armyCount = parseInt(armyElement.innerText);
    var landCount = parseInt(armyElement.innerText);
    // Check for our color
    if (username === ourUsername) {
      gameState.ourColor = color;
    }

    leaderboard.push({
      color: color,
      username: username,
      army: armyCount,
      land: landCount
    });
  }
  logger.trace(leaderboard);
  gameState.leaderboard = leaderboard;
}

function populateGameState() {
  var gameMap = document.getElementById("map").children[0];

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

  var turnCounterElement = document.getElementById("turn-counter");
  gameState.turnCounter = parseInt(turnCounterElement.textContent.match(/\d+/gi));

  parseGameLeaderboard(gameState, 'boisterous');

  logger.trace("our color: " + gameState.ourColor);
  logger.trace("r: " + gameState.numRows + " c: " + gameState.numCols);
  logger.trace(gameState.turnCounter);
  return gameState;
}

function tick() {
  logger.trace("Tick!");
  // populate game state
  var gameState = populateGameState();
  // feed game state into AI engine
  processGameState(gameState);
}

// Main
// Tick every 500 milliseconds
window.setInterval(tick, 500);
