var P = require("parsimmon");

var ast = require("../ast");

var Number_ =
    P.regex(/[0-9]+/)
    .desc("number")
    .map(global.Number)
    .map(ast.Number);

module.exports = function(ps) {
    return Number_;
};
