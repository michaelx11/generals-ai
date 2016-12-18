var logger = {};
var DEBUG_LEVEL = 5;
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

// Create logging panel on the left
