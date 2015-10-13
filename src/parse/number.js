var P = require("parsimmon");

var ast = require("../ast");
var H = require("../parse-helpers");

var join = H.join;

function stripUnderscores(s) {
    return s.replace(/_/g, "");
}

var Integer =
    P.alt(
        P.regex(/[1-9][0-9_]*[0-9]/),
        P.regex(/[0-9]/)
    )
    .desc("integer");

var FractionalDigits =
    P.seq(
        P.string("."),
        P.regex(/[0-9]/),
        P.regex(/[0-9_]*[0-9]/).or(P.of(""))
    )
    .desc("fractional digits")
    .map(join(""));

var Exponential =
    P.seq(
        P.regex(/[eE]/),
        P.regex(/[+-]?/),
        Integer
    )
    .desc("exponential")
    .map(join(""));

var Float =
    P.seq(
        Integer,
        FractionalDigits.or(P.of("")),
        Exponential.or(P.of(""))
    )
    .map(join(""));

var NaN_ = P.string("NaN").desc("NaN");
var Infinity_ = P.string("Infinity").desc("Infinity");

var Number_ =
    P.alt(Float, NaN_, Infinity_)
    .desc("number")
    .map(stripUnderscores)
    .map(global.Number)
    .map(ast.Number);

module.exports = function(ps) {
    return Number_;
};
