"use strict";

var LH = require("./transform/let-helpers");

function concat(a, b) {
    return a.concat(b);
}

function identsForBlock(transform, node) {
    return node
        .statements
        .filter(function(node) {
            return node.type === "Let";
        })
        .map(function(theLet) {
            return LH
                .bindingToDeclAndInit(transform, theLet.binding)
                .identifiers;
        })
        .reduce(concat, []);
}

module.exports = identsForBlock;
