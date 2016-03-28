"use strict";

var es = require("../es");
var helperNamed = require("../helper-named");

function GetProperty(transform, node) {
  var obj = node.obj;
  var prop = node.prop;
  var f = helperNamed("objectGet");
  var args = [obj, prop].map(transform);
  return es.CallExpression(null, f, args);
}

module.exports = GetProperty;
