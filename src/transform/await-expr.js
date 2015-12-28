"use strict";

function AwaitExpr(transform, node) {
    return transform(node.expression);
}

module.exports = AwaitExpr;
