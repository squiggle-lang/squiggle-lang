"use strict";

var es = require("../es");

function String_(transform, node) {
    return es.Literal(node.loc, node.data);
}

module.exports = String_;
