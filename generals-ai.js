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
// == Core game AI ==
var globalTurnCounter = 0; // we only process once per tick
var RECENTLY_VISITED_TILES_MAX_LENGTH = 30;
// don't consider the most recent moves (too easy to box in)
var RECENTLY_VISITED_TILES_CUSHION_LENGTH = 10;
var RECENTLY_VISITED_TILES_FUDGE_PROB = .25;
var recentlyVisitedTiles = []; // Keep recently visited tiles

function processGameState(gameState) {
  // do nothing
  if (gameState.turnCounter <= globalTurnCounter) {
    return;
  }

  logger.trace(gameState);

  globalTurnCounter = gameState.turnCounter;
  makeRandomMove(gameState);
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

function shuffle(a) {
  for (let i = a.length; i; i--) {
    let j = Math.floor(Math.random() * i);
    [a[i - 1], a[j]] = [a[j], a[i - 1]];
  }
}

var DIRECTIONS = [
  [0, -1],
  [-1, 0],
  [0, 1],
  [1, 0]
];

// Return {dirs: [...], tiles: [...]}
function getValidMoveDirections(gameState, tileObj) {
  let row = tileObj.row;
  let col = tileObj.col;

  logger.trace("checking orig row: " + row + " col: " + col);

  let validMoves = [];
  let validTiles = [];
  let weights = [];
  // Iterate through directions
  for (let i = 0; i < DIRECTIONS.length; i++) {
    let newR = row + DIRECTIONS[i][0];
    let newC = col + DIRECTIONS[i][1];

    if (newR < 0 || newR >= gameState.numRows || newC < 0 || newC >= gameState.numCols) {
      continue;
    }

    logger.trace("newR: " + newR + " newC: " + newC);

    let newTile = gameState.tileGrid[newR][newC];
    if (newTile.desc.search(/mountain/gi) >= 0) {
      logger.trace("skipped");
      continue;
    }

    // Don't attempt to eat a city unless you're big enough!
    if (newTile.desc.search(/city/gi) >= 0) {
      if (tileObj.unitCount <= newTile.unitCount) {
        continue;
      }
    }

    validTiles.push(newTile);
    validMoves.push(i);
  }
  return {moves: validMoves, tiles: validTiles};
}

// Exploratory weight function!
function explorerWeightFunction(newTile) {
  // baseline
  let weight = 1.0;
  // new tile bonus
  if (newTile.desc.search(/selectable/gi) < 0) {
    weight += 10.0;
    // city bonus if not captured
    if (newTile.desc.search(/city/gi) >= 0) {
      weight += 50.0;
    }
  }
  // unitCount bonus
  weight += newTile.unitCount / 100.0;
  return weight;
}

function checkAgainstRecentTiles(newTile) {
  for (let i = RECENTLY_VISITED_TILES_CUSHION_LENGTH; i < recentlyVisitedTiles.length; i++) {
    if (newTile.row == recentlyVisitedTiles[i].row &&
        newTile.col == recentlyVisitedTiles[i].col) {
      return false;
    }
  }
  return true;
}

function appendToRecentlyVisitedTiles(newTile) {
  recentlyVisitedTiles.push(newTile);
  if (recentlyVisitedTiles.length > RECENTLY_VISITED_TILES_MAX_LENGTH) {
    recentlyVisitedTiles.shift();
  }
}

function makeRandomMove(gameState) {
  let ourTiles = getOurTiles(gameState);
  ourTiles.sort(function(a, b) {
    // Sort descending in terms of unitcount
    return b.unitCount - a.unitCount;
  });
  // Only take the largest 5 clumps
  let bigTiles = ourTiles.slice(0, 5);
  shuffle(bigTiles);
  for (let i = 0; i < bigTiles.length; i++) {
    if (bigTiles[i].unitCount <= 1) {
      continue;
    }
    let validMoveResult = getValidMoveDirections(gameState, bigTiles[i], explorerWeightFunction);
    let validMoves = validMoveResult.moves;
    let validTiles = validMoveResult.tiles;

    let totalWeight = 0.0;
    let weights = [];
    for (let u = 0; u < validTiles.length; u++) {
      let tempW = explorerWeightFunction(validTiles[u]);
      totalWeight += tempW;
      weights.push(tempW);
    }

    let accum = 0.0;
    let rand = Math.random();
    let u = 0;
    for (; u < validMoves.length - 1; u++) {
      accum += weights[u];
      if (rand <= accum / totalWeight) {
        if (checkAgainstRecentTiles(validTiles[u]) || Math.random() > RECENTLY_VISITED_TILES_FUDGE_PROB) {
          performMove(bigTiles[i].row, bigTiles[i].col, validMoves[u]);
          appendToRecentlyVisitedTiles(validTiles[u]);
          return;
        }
      }
    }
    // last move
    if (checkAgainstRecentTiles(validTiles[u]) || Math.random() > RECENTLY_VISITED_TILES_FUDGE_PROB) {
      performMove(bigTiles[i].row, bigTiles[i].col, validMoves[u]);
      appendToRecentlyVisitedTiles(validTiles[u]);
      return;
    }
  }
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
  return filterTilesForDesc(gameState, /selectable/gi);
}

function getOurGeneralTile(gameState) {
  var generalTiles = filterTilesForDesc(gameState, /selectable.*general/gi);
  if (generalTiles.length != 1) {
    return null;
  }
  return generalTiles[0];
}
