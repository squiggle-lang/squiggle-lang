"use strict";

var ast = require("../ast");

function GetIndex(transform, node) {
  var array = node.array;
  var index = node.arrayIndex;
  var id = ast.Identifier(node.loc, "$at");
  var call = ast.Call(null, id, [array, index]);
  return transform(call);
}

module.exports = GetIndex;
