var ast = require("../ast");
var es = require("../es");

var table = {
    "*": "multiply",
    "/": "divide",
    "+": "add",
    "-": "subtract",
    "++": "concat",
    "~": "update",
    ">=": "gte",
    "<=": "lte",
    "<": "lt",
    ">": "gt",
    "==": "eq",
    has: "has",
    is: "is",
    "!=": "neq"
};

var boolTable = {
    and: "&&",
    or: "||"
};

function bool(x) {
    return ast.Call(ast.Identifier("$bool"), [x]);
}

function BinOp(transform, node) {
    var d = node.operator.data;
    // `and` and `or` cannot be implemented as functions due to short circuiting
    // `behavior, so they work differently.
    if (d === 'and' || d === 'or') {
        var op = boolTable[d];
        var left = transform(bool(node.left));
        var right = transform(bool(node.right));
        return es.LogicalExpression(op, left, right);
    } else {
        var name = "$" + table[node.operator.data];
        var f = ast.Identifier(name);
        var args = [node.left, node.right];
        var call = ast.Call(f, args);
        return transform(call);
    }
}

module.exports = BinOp;
