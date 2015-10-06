var es = require("../es");
var ast = require("../ast");

function Call(transform, node) {
    if (node.f.type === "GetProperty") {
        var obj = node.f.obj;
        var prop = node.f.prop;
        var cmArgs = node.args;
        var cmNode = ast.CallMethod(obj, prop, cmArgs);
        return transform(cmNode);
    }
    var f = transform(node.f);
    var args = node.args.map(transform);
    return es.CallExpression(f, args);
}

module.exports = Call;
