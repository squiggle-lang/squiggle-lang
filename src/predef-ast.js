var fs = require("fs");
var path = require("path");
var esprima = require("esprima");

var predef = require("../build/predef");
var ast = esprima.parse(predef);

module.exports = ast;
