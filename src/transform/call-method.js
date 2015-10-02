var es = require("../es");

function CallMethod(transform, node) {
    var obj = transform(node.obj);
    var prop = transform(node.prop);
    var method = es.MemberExpression(true, obj, prop);
    var args = node.args.map(transform);
    return es.CallExpression(method, args);
}

module.exports = CallMethod;
