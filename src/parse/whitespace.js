var P = require("parsimmon");

var Newline = P.regex(/\n/);

var NotNewlines = P.regex(/[^\n]*/);

var Comment =
    P.string("#")
    .then(NotNewlines)
    .skip(Newline.or(P.eof));

var Whitespace = P.alt(P.whitespace, Comment).many();

module.exports = function(ps) {
    return Whitespace;
};
