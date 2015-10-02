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
        return es.LogicalExpression(
            boolTable[d],
            transform(bool(node.left)),
            transform(bool(node.right))
        );
    } else {
        var name = "$" + table[node.operator.data];
        var f = ast.Identifier(name);
        var args = [node.left, node.right];
        var call = ast.Call(f, args);
        return transform(call);
    }
}

module.exports = BinOp;
