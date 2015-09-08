var es = require("./es");

function fileWrapper(body) {
    var useStrict = es.ExpressionStatement(es.Literal('use strict'));
    var newBody = [useStrict].concat(body);
    var fn = es.FunctionExpression(null, [], es.BlockStatement(newBody));
    var i = newBody.length - 1;
    newBody[i] = es.ReturnStatement(newBody[i]);
    var st = es.ExpressionStatement(es.CallExpression(fn, []));
    return es.Program([st]);
}

module.exports = fileWrapper;
