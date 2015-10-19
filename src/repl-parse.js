// var P = require("parsimmon");

var parser = require("./parser");

// var H = require("./parse-helpers");

// var spaced = H.spaced;
var Expr = parser.Expr;
// var Binding = parser.Binding;

// function command(str) {
//     return P.string(":").then(P.string(str));
// }

// ReplHelp:       [],
// ReplQuit:       [],
// ReplBinding:    ["binding"],
// ReplExpression: ["expression"],

// var ReplStart = spaced(P.alt(
//     // command("set").then(_).then(Binding).map(ast.ReplBinding),
//     // command("help").result(ast.ReplHelp()),
//     // command("quit").result(ast.ReplQuit()),
//     Expr
// ));

function replParse(text) {
    // return ReplStart.parse(text);
    return Expr.parse(text);
}

module.exports = replParse;
