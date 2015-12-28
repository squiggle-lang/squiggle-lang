"use strict";

var P = require("parsimmon");

var H = require("../parse-helpers");

var spaced = H.spaced;

var Separator = spaced(P.string(","));

module.exports = function(ps) {
    return Separator;
};
