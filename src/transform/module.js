"use strict";

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
  var theExports = makeExportsFor(transform, node.exports);

  // BEGIN HACK: Add the exports into the block
  var theBody = blockJs.callee.body.body;
  theBody.pop();
  theExports.forEach(function(exp) {
    theBody.push(exp);
  });
  // END HACK

  // REPL code doesn't need a big wrapper with predef stuff. Eventually this
  // should be usable for Browserify somehow too, to avoid duplication.
  if (node.bareModule) {
    // TODO: Kinda gross to just reach into the compiled output like this.
    var blockInnards = blockJs.callee.body.body;
    return es.Program(null, blockInnards);
  } else {
    // TODO: This might be a bad hack, but it makes the output one level
    // shallower for now.
    var statements = blockJs.callee.body.body;
    return fileWrapper(statements);
  }
}

module.exports = Module;
