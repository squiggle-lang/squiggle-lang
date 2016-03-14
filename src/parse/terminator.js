"use strict";

var P = require("parsimmon");

var Comment = require("./comment")(null);
var _ = require("./whitespace")(null);
var H = require("../parse-helpers");

var spaced = H.spaced;

module.exports = function(ps) {
  var NonNewlineWhitespace = P.regex(/[ \t]*/); // TODO: Comments
  var NNW = NonNewlineWhitespace;
  var Semicolon = spaced(P.string(";"));
  var Newline = NNW.then(P.string("\n")).skip(_).desc("newline");
  var CommentWhitespace = NNW.then(Comment).then(_);
  var ImpliedTerminator = Newline.or(CommentWhitespace);
  return P.alt(ImpliedTerminator, Semicolon);
};
