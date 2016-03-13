"use strict";

var flatten = require("lodash/array/flatten");

var es = require("../es");
var LH = require("./let-helpers");
var identsForBlock = require("../idents-for-block");

function concat(a, b) {
    return a.concat(b);
}

function Block(transform, node) {
    // var tmpDecl = LH.esDeclare(null, LH.tmp, null);
    // var decls = identsForBlock(transform, node)
    //     .map(function(identifier) {
    //         return LH.esDeclare(null, identifier, LH.undef);
    //     });
    var needsTmpVar = false;
    var statements = node
        .statements
        .filter(function(node) {
            return node.fullType !== "ast.Declaration";
        })
        .map(function(node) {
            if (node.fullType === "ast.Let") {
                // HACK: PatternSimple gets compiled to not use $tmp
                if (node.binding.pattern.fullType !== "ast.PatternSimple") {
                    needsTmpVar = true;
                }
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
    // var tmp = needsTmpVar ? [tmpDecl] : [];
    var everything = flatten([statements, [retStmt]]);
    var block = es.BlockStatement(null, everything);
    var fn = es.FunctionExpression(null, null, [], block);
    return es.CallExpression(null, fn, []);
}

module.exports = Block;
