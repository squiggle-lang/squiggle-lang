var fs = require("fs");
var path = require("path");
var esprima = require("esprima");

var predef = fs.readFileSync(__dirname + '/../runtime/predef.js', 'utf8');
var ast = esprima.parse(predef);

module.exports = ast;
