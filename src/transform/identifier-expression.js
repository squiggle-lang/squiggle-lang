"use strict";

function IdentifierExpression(transform, node) {
    if (node.data.data === "_") {
        throw new Error("squiggle: variable '_' cannot be referenced " +
            "as it will never be bound");
    }
    return transform(node.data);
}

module.exports = IdentifierExpression;
