var es = require("../es");
var ast = require("../ast");

function Call(transform, node) {
    if (node.f.type === "GetProperty") {
        var obj = node.f.obj;
        var prop = node.f.prop;
        var args = node.args;
        var node = ast.CallMethod(obj, prop, args);
        return transform(node);
    }
    var f = transform(node.f);
    var args = node.args.map(transform);
    return es.CallExpression(f, args);
}

module.exports = Call;
