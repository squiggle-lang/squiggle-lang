var P = require("parsimmon");

var H = require("../parse-helpers");

var spaced = H.spaced;

module.exports = function(ps) {
    return spaced(P.string(";"));
};
