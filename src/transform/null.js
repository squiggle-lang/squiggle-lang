var es = require("../es");

function Null(transform, node) {
    return es.Literal(node.loc, null);
}

module.exports = Null;
