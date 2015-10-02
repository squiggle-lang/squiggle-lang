var PREDEF = require("../predef-ast");
var fileWrapper = require("../file-wrapper");
var es = require("../es");

function moduleExportsEq(x) {
    var moduleExports =
        es.MemberExpression(
            false,
            es.Identifier('module'),
            es.Identifier('exports')
        );
    return es.AssignmentExpression('=', moduleExports, x);
}

function Module(transform, node) {
    var value = transform(node.expr);
    var expr = moduleExportsEq(value);
    var body = PREDEF.body.concat([expr]);
    return fileWrapper(body);
}

module.exports = Module;
