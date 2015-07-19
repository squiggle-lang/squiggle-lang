var fs = require("fs");
var path = require("path");
var esprima = require("esprima");

var f = path.join(__dirname, '../runtime/predef.js');
var ast = esprima.parse(fs.readFileSync(f));

module.exports = ast;
