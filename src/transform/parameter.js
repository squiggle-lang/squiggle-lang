"use strict";

function Parameter(transform, node) {
  return transform(node.identifier);
}

module.exports = Parameter;
