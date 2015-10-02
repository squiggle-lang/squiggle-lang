var ast = require("../ast");

function GetMethod(transform, node) {
    var obj = node.obj;
    var prop = node.prop;
    var method = ast.Identifier('$method');
    var call = ast.Call(method, [obj, prop]);
    return transform(call);
}

module.exports = GetMethod;
