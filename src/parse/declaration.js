"use strict";

var ast = require("../ast");
var H = require("../parse-helpers");
var _ = require("./whitespace")(null);

var keyword = H.keyword;
var ione = H.ione;

module.exports = function(ps) {
    return ione(ast.Declaration,
        keyword("declare")
            .then(_)
            .then(ps.Identifier)
    );
};
