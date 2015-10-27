var es = require("../es");

function Array_(transform, node) {
    var pairs = node.data.map(transform);
    var callee = es.Identifier(null, '$array');
    return es.CallExpression(node.loc, callee, pairs);
}

module.exports = Array_;
