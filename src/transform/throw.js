"use strict";

var throwHelper = require("../throw-helper");

function Throw(transform, node) {
    var exception = transform(node.exception);
    return throwHelper(node, exception);
}

module.exports = Throw;
