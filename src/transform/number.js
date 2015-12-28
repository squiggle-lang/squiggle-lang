"use strict";

var es = require("../es");

function Number_(transform, node) {
    // Check for NaN
    if (node.data !== node.data) {
        return es.Identifier(node.loc, "NaN");
    }
    if (node.data === Infinity) {
        return es.Identifier(node.loc, "Infinity");
    }
    return es.Literal(node.loc, node.data);
}

module.exports = Number_;
