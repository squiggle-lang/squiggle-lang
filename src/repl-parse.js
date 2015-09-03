var P = require("parsimmon");
var ast = require("./ast");
var parser = require("./parser");

var spaced = parser.spaced;
var _ = parser._;
var Binding = parser.Binding;
var Expr = parser.Expr;

function command(str) {
    return P.string(":").then(P.string(str));
}

var ReplStart = spaced(P.alt(
    command("set").then(_).then(Binding).map(ast.ReplBinding),
    command("help").result(ast.ReplHelp()),
    command("quit").result(ast.ReplQuit()),
    Expr
));

function replParse(text) {
    return ReplStart.parse(text);
}

module.exports = replParse;
