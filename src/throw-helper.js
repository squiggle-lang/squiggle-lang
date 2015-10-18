var es = require("./es");

function throwHelper(node, esNode) {
    if (arguments.length !== throwHelper.length) {
        throw new Error("wrong number of arguments to throwHelper");
    }
    var throw_ = es.ThrowStatement(node.loc, esNode);
    var block = es.BlockStatement(null, [throw_]);
    var fn = es.FunctionExpression(null, null, [], block);
    return es.CallExpression(null, fn, []);
}

module.exports = throwHelper;
