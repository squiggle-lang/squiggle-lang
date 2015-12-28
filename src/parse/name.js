"use strict";

var P = require("parsimmon");

module.exports = function(ps) {
    return P.regex(/[_a-z][_a-z0-9]*/i).desc("name");
};
