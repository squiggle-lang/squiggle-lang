var flatten = require("lodash/array/flatten");

var es = require("../es");
var LH = require("./let-helpers");
var identsForBlock = require("../idents-for-block");

function concat(a, b) {
    return a.concat(b);
}

function Block(transform, node) {
    var tmpDecl = LH.esDeclare(null, LH.tmp, null);
    var decls = identsForBlock(transform, node)
        .map(function(identifier) {
            return LH.esDeclare(null, identifier, LH.undef);
        });
    var statements = node
        .statements
        .map(function(node) {
            if (node.type === "Let") {
                // TODO: Don't call LH.bindingToDeclAndInit *again*
                return LH
                    .bindingToDeclAndInit(transform, node.binding)
                    .initialization;
            } else {
                return transform(node);
            }
        })
        .reduce(concat, []);
    var expr = transform(node.expression.expression);
    var retStmt = es.ReturnStatement(node.expression.loc, expr);
    var tmp =
        decls.length === 0 ?
            [] :
            [tmpDecl];
    var everything = flatten([tmp, decls, statements, [retStmt]]);
    var block = es.BlockStatement(null, everything);
    var fn = es.FunctionExpression(null, null, [], block);
    return es.CallExpression(null, fn, []);
}

module.exports = Block;
