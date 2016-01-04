"use strict";

var P = require("parsimmon");

var ast = require("../ast");
var H = require("../parse-helpers");
var _ = require("./whitespace")(null);

var spaced = H.spaced;
var keyword = H.keyword;
var iseq = H.iseq;

module.exports = function(ps) {
    var TopLevelStatement =
        _.then(ps.Statement)
        .skip(ps.Terminator);
    var TopLevel = TopLevelStatement.many();
    var Export =
        _.then(keyword("export"))
        .then(ps.Identifier)
        .skip(ps.Terminator);
    var Exports = Export.many();
    var Module =
        iseq(ast.Module,
            P.seq(
                TopLevel,
                Exports
            )
        );
    return spaced(Module);
};

