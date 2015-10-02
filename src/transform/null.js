var es = require("../es");

var nil = es.Literal(null);

function Null(transform, node) {
    return nil;
}

module.exports = Null;
