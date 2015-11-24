var esprima = require("esprima");

var es = require("./es");

function fileWrapper(body) {
    var useStrict = es.ExpressionStatement(null,
        es.Literal(null, 'use strict'));
    var strictCheck = esprima.parse(
        "if ((function() { 'use strict'; return this }())) {\n" +
        "   throw new Error('strict mode not supported');\n" +
        "}"
    ).body;
    var newBody = [useStrict].concat(strictCheck).concat(body);
    var fn = es.FunctionExpression(null,
        null, [], es.BlockStatement(null, newBody));
    var i = newBody.length - 1;
    newBody[i] = es.ReturnStatement(null, newBody[i]);
    var st = es.ExpressionStatement(null, es.CallExpression(null, fn, []));
    return es.Program(null, [st]);
}

module.exports = fileWrapper;
