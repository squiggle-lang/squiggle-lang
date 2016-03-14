"use strict";

var es = require("../es");

function False(transform, node) {
  return es.Literal(node.loc, false);
}

module.exports = False;
