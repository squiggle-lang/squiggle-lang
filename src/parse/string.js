var P = require("parsimmon");

var ast = require("../ast");

var DQuote = P.string('"');

var StringChars = P.regex(/[^"\n]*/);

var String_ =
    DQuote.then(StringChars).skip(DQuote)
    .desc("string")
    .map(ast.String);

module.exports = function(ps) {
    return String_;
};
