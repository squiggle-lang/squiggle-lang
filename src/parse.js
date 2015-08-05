var peg = require("pegjs");
var path = require("path");
var fs = require("fs");

var filename = path.join(__dirname, "../grammars/parser.pegjs");
var grammar = fs.readFileSync(filename, "utf8");

module.exports = function parserFor(opts) {
    opts = opts || {};
    opts.cache = true;
    return peg.buildParser(grammar, opts).parse;
}
