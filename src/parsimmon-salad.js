var P = require("parsimmon");

function parsimmonSalad(almostParsers) {
    var parsers = {};
    var keys = Object.keys(almostParsers);
    keys.forEach(function(k) {
        var f = almostParsers[k];
        var g = f.bind(null, parsers);
        parsers[k] = P.lazy(g);
    });
    Object.freeze(parsers);
    return parsers;
}

module.exports = parsimmonSalad;
