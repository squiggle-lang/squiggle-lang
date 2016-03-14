"use strict";

var fileWrapper = require("../file-wrapper");

function ReplExpression(transform, node) {
  return fileWrapper([transform(node.expression)]);
}

module.exports = ReplExpression;
