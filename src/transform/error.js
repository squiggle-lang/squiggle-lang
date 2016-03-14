"use strict";

var throwHelper = require("../throw-helper");
var es = require("../es");

function Error(transform, node) {
  var message = transform(node.message);
  var error = es.Identifier(null, "Error");
  var exception = es.NewExpression(null, error, [message]);
  return throwHelper(node, exception);
}

module.exports = Error;
