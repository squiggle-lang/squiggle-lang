"use strict";

var ast = require("../ast");

function GetMethod(transform, node) {
  var obj = node.obj;
  var prop = node.prop;
  var method = ast.Identifier(node.loc, '$method');
  var call = ast.Call(null, method, [obj, prop]);
  return transform(call);
}

module.exports = GetMethod;
