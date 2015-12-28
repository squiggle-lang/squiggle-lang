"use strict";

var es = require("../es");

function Require(transform, node) {
    var path = transform(node.expr);
    var id = es.Identifier(node.loc, "require");
    return es.CallExpression(null, id, [path]);
}

module.exports = Require;
