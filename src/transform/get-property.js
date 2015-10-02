var ast = require("../ast");

function GetProperty(transform, node) {
    var obj = node.obj;
    var prop = node.prop;
    var id = ast.Identifier("$get");
    var call = ast.Call(id, [obj, prop]);
    return transform(call);
}

module.exports = GetProperty;
