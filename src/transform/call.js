var es = require("../es");

function Call(transform, node) {
    var f = transform(node.f);
    var args = node.args.map(transform);
    return es.CallExpression(f, args);
}

module.exports = Call;
