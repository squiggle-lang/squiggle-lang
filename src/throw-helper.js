var es = require("./es");

function throwHelper(esNode) {
    var throw_ = es.ThrowStatement(esNode);
    var block = es.BlockStatement([throw_]);
    var fn = es.FunctionExpression(null, [], block);
    return es.CallExpression(fn, []);
}

module.exports = throwHelper;
