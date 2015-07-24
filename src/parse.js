var peg = require("pegjs");
var path = require("path");
var fs = require("fs");

var filename = path.join(__dirname, "../grammars/parser.pegjs");
var grammar = fs.readFileSync(filename, "utf8");
var parser = peg.buildParser(grammar, {cache: true});

module.exports = parser.parse;
