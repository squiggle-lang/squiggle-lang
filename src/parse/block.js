"use strict";

var P = require("parsimmon");

var ast = require("../ast");
var H = require("../parse-helpers");

var iseq = H.iseq;

module.exports = function(ps) {
    return iseq(ast.Block,
        ps.Statement.skip(ps.Terminator).atLeast(1).map(function(statements) {
            var n = statements.length;
            var i = n - 1;
            var last = statements[i];
            if (last.type !== "ExprStmt") {
                return P.fail("blocks must end with an expression");
            }
            return [statements.slice(0, i), last];
        })
    );
};
