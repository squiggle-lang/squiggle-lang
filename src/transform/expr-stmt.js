"use strict";

var es = require("../es");

function ExprStmt(transform, node) {
    return es.ExpressionStatement(node.loc, transform(node.expression));
}

module.exports = ExprStmt;
