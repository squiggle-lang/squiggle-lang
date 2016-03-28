"use strict";

var esprima = require("esprima");

var es = require("./es");

function fileWrapper(body) {
  var useStrict = es.ExpressionStatement(null,
    es.Literal(null, 'use strict'));
  var strictCheck = esprima.parse(
    "if (this) {\n" +
    " throw new Error('strict mode not supported');\n" +
    "}"
  ).body;
  var import_ = esprima.parse(
    "var $$ = require('squiggle-lang/src/rt/__internal');"
  ).body;
  var newBody =
    [useStrict]
      .concat(strictCheck)
      .concat(import_)
      .concat(body);
  var global_ = es.Identifier(null, "$global");
  var this_ = esprima.parse(
    "(function() { return this; }())"
  ).body[0].expression;
  var block = es.BlockStatement(null, newBody);
  var fn = es.FunctionExpression(null, null, [global_], block);
  var call = es.CallExpression(null, fn, [this_]);
  var st = es.ExpressionStatement(null, call);
  return es.Program(null, [st]);
}

module.exports = fileWrapper;
