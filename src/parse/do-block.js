"use strict";

var P = require("parsimmon");

var _ = require("./whitespace")(null);
var H = require("../parse-helpers");

module.exports = function(ps) {
    var do_ = H.keyword("do");
    var end = H.keyword("end");
    return H.pwrap(do_, ps.Block, end)
};
