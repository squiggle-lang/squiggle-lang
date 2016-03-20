"use strict";

var es = require("../es");

function Debugger(transform, node) {
  return es.DebuggerStatement(node.loc);
}

module.exports = Debugger;
