var P = require("parsimmon");

var Newline = P.regex(/\n/);
var NotNewlines = P.regex(/[^\n]*/);

module.exports = function(ps) {
    return P.string("#")
        .then(NotNewlines)
        .skip(Newline.or(P.eof));
};
