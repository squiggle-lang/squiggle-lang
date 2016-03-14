"use strict";

var ast = require("../ast");

function GetProperty(transform, node) {
  var obj = node.obj;
  var prop = node.prop;
  var id = ast.Identifier(node.loc, "$get");
  var call = ast.Call(null, id, [obj, prop]);
  return transform(call);
}

module.exports = GetProperty;
