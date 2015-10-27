var es = require("./es");

function fileWrapper(body) {
    var useStrict = es.ExpressionStatement(null,
        es.Literal(null, 'use strict'));
    var newBody = [useStrict].concat(body);
    var fn = es.FunctionExpression(null,
        null, [], es.BlockStatement(null, newBody));
    var i = newBody.length - 1;
    newBody[i] = es.ReturnStatement(null, newBody[i]);
    var st = es.ExpressionStatement(null, es.CallExpression(null, fn, []));
    return es.Program(null, [st]);
}

module.exports = fileWrapper;
