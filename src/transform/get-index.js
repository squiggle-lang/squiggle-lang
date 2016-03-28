"use strict";

var es = require("../es");
var helperNamed = require("../helper-named");

function GetIndex(transform, node) {
  var array = transform(node.array);
  var index = transform(node.arrayIndex);
  var id = helperNamed("arrayGet");
  return es.CallExpression(null, id, [array, index]);
}

module.exports = GetIndex;
