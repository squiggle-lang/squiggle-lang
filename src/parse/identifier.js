"use strict";

var P = require("parsimmon");

var ast = require("../ast");
var ione = require("../parse-helpers").ione;

// TODO: Move this into its own module or something later
var keywords = [
    "try",
    "throw",
    "error",
    "fn",
    "if", "then", "elseif", "else",
    "match", "case", "end",
    "let", "def",
    "has", "is",
    "and", "or",
    "do",
    "global",
    "await",
    "true", "false",
    "null", "undefined",
    "NaN", "Infinity"
];

function helper(id) {
    if (keywords.indexOf(id) < 0) {
        return P.of(id);
    } else {
        return P.fail("identifier but got keyword '" + id + "'");
    }
}

module.exports = function(ps) {
    return ione(ast.Identifier, ps.Name.chain(helper));
};
