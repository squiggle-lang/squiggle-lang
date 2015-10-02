var es = require("../es");

var nope = es.Literal(false);

function False(transform, node) {
    return nope;
}

module.exports = False;
