"use strict";

var es = require("../es");

function True(transform, node) {
    return es.Literal(node.loc, true);
}

module.exports = True;
