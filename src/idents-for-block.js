"use strict";

var LH = require("./transform/let-helpers");

function concat(a, b) {
    return a.concat(b);
}

function identsForBlock(transform, node) {
    return node
        .statements
        .filter(function(node) {
            return node.fullType === "ast.Let";
        })
        .map(function(node) {
            return LH
                .bindingToDeclAndInit(transform, node.binding)
                .identifiers;
        })
        .reduce(concat, []);
}

module.exports = identsForBlock;
