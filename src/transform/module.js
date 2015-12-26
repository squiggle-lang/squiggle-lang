var helpersFor = require("../helpers-for");
var fileWrapper = require("../file-wrapper");
var ast = require("../ast");
var es = require("../es");

function makeExportsFor(transform, exportVars) {
    return exportVars.map(function(v) {
        var varName = es.Literal(null, v.data);
        var varRef = transform(v);
        var jsExports = es.Identifier(null, "exports");
        var exportRef =
            es.MemberExpression(v.loc, true, jsExports, varName);
        var setExportRef =
            es.AssignmentExpression(null, "=", exportRef, varRef);
        return es.ExpressionStatement(null, setExportRef);
    });
}

function Module(transform, node) {
    var retUndef = ast.ExprStmt(null, ast.Undefined(null));
    var block = ast.Block(null, node.statements, retUndef);
    var blockJs = transform(block);
    var predef = helpersFor(blockJs);
    var theExports = makeExportsFor(transform, node.exports);
    // BEGIN HACK: Add the exports into the block
    var theBody = blockJs.callee.body.body;
    theBody.pop();
    theExports.forEach(function(exp) {
        theBody.push(exp);
    });
    // END HACK
    var body = predef.concat([es.ExpressionStatement(null, blockJs)]);
    return fileWrapper(body);
}

module.exports = Module;
