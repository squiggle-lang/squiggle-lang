var P = require("parsimmon");

var H = require("../parse-helpers");

var spaced = H.spaced;

module.exports = function(ps) {
    var NonNewlineWhitespace = P.regex(/[ \t]*/); // TODO: Comments
    var NNW = NonNewlineWhitespace;
    var Semicolon = spaced(P.string(";"));
    var Newline = NNW.then(P.string("\n")).skip(NNW).desc("newline");
    // return P.alt(Newline, Semicolon);
    return P.alt(Newline, Semicolon);
};
