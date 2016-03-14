"use strict";

var P = require("parsimmon");

var Comment = require("./comment")(null);
var Whitespace = P.alt(P.whitespace, Comment).many();

module.exports = function(ps) {
  return Whitespace;
};
