"use strict";

var H = require("../parse-helpers");
var ast = require("../ast");

var keyword = H.keyword;
var inone = H.inone;

module.exports = function(ps) {
  return inone(ast.Debugger, keyword("debugger"));
};
