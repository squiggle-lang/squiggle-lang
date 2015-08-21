var esprima = require("esprima");
var predef = require("../build/predef");

var ast = esprima.parse(predef);

module.exports = ast;
