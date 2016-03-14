"use strict";

var es = require("../es");

function Await(transform, node) {
  // TODO: Allow pattern matching here when that feature gets added.
  var id = transform(node.binding);
  var expr = transform(node.expression);
  var promise = transform(node.promise);
  var return_ = es.ReturnStatement(null, expr);
  var body = [return_];
  var block = es.BlockStatement(null, body);
  var cb = es.FunctionExpression(null, null, [id], block);
  var then = es.Identifier(null, "then");
  var method = es.MemberExpression(null, false, promise, then);
  return es.CallExpression(node.loc, method, [cb]);
}

module.exports = Await;
