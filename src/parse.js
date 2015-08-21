var peg = require("pegjs");
var path = require("path");
var fs = require("fs");

var grammar = fs.readFileSync(__dirname + "/../grammars/parser.pegjs", "utf8");

module.exports = function parserFor(opts) {
    opts = opts || {};
    opts.cache = true;
    return peg.buildParser(grammar, opts).parse;
};
