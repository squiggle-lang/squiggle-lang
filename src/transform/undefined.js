var es = require("../es");

var nothing = es.Identifier("undefined");

function Undefined(transform, node) {
    return nothing;
}

module.exports = Undefined;
