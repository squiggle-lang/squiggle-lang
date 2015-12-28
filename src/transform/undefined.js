"use strict";

var es = require("../es");

function Undefined(transform, node) {
    return es.Identifier(node.loc, "undefined");
}

module.exports = Undefined;
