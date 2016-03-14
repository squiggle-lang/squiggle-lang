"use strict";

var es = require("../es");

function Global(transform, node) {
  return es.Identifier(node.loc, "$global");
}

module.exports = Global;
