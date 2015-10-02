var es = require("../es");

function Array_(transform, node) {
    var pairs = node.data.map(transform);
    var callee = es.Identifier('$array');
    return es.CallExpression(callee, pairs);
}

module.exports = Array_;
