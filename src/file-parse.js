"use strict";

var parser = require("./parser");
var addLocMaker = require("./file-index-to-position-mapper");
var traverse = require("./traverse");

function fileParse(text) {
  var res = parser.Module.parse(text);
  if (res.status) {
    var addLocToNode = addLocMaker(text);
    traverse.walk({enter: addLocToNode}, res.value);
  }
  return res;
}

module.exports = fileParse;
