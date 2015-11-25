// var inspect = require("../inspect");
var ast = require("../ast");
var es = require("../es");

function bool(x) {
    return ast.Call(null, ast.Identifier(null, "$bool"), [x]);
}

// It would totally work to just generate code like `P ? X : Y`, but pretty
// printers don't tend to make nested usages of such even remotely readable, so
// we just use a function wrapper and normal if/else.

function If(transform, node) {
    var if_ = ifHelper(transform, node);
    var block = es.BlockStatement(null, [if_]);
    var fn = es.FunctionExpression(null, null, [], block);
    return es.CallExpression(null, fn, []);
}

function ifHelper(transform, node) {
    if (node.type === "If") {
        var p = transform(bool(node.p));
        var t = ifHelper(transform, node.t);
        var f = ifHelper(transform, node.f);
        return es.IfStatement(node.loc, p, t, f);
    } else {
        var return_ = es.ReturnStatement(node.loc, transform(node));
        return es.BlockStatement(null, [return_]);
    }
}

module.exports = If;
