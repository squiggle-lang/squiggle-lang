"use strict";

var flatten = require("lodash/array/flatten");
var unusedOrUndeclared = require("./linters/unused-or-undeclared");

function lint(ast) {
    return flatten([
        unusedOrUndeclared(ast)
    ]);
}

module.exports = lint;
