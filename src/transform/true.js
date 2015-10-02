var es = require("../es");

var theTruth = es.Literal(true);

function True(transform, node) {
    return theTruth;
}

module.exports = True;
