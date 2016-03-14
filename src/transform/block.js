"use strict";

var flatten = require("lodash/array/flatten");

var es = require("../es");
var LH = require("./let-helpers");

function concat(a, b) {
    return a.concat(b);
}

function Block(transform, node) {
    var statements = node
        .statements
        .filter(function(node) {
            return node.fullType !== "ast.Declaration";
        })
        .map(function(node) {
            if (node.fullType === "ast.Let") {
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
    var everything = flatten([statements, [retStmt]]);
    var block = es.BlockStatement(null, everything);
    var fn = es.FunctionExpression(null, null, [], block);
    return es.CallExpression(null, fn, []);
}

module.exports = Block;
