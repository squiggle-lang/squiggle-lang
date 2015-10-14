var ast = require("../ast");
var H = require("../parse-helpers");

var spaced = H.spaced;
var word = H.word;
var ione = H.ione;

module.exports = function(ps) {
    var Script = ione(ast.Script, ps.Expr);
    var Module = ione(ast.Module, word("export").then(ps.Expr));
    return spaced(Module.or(Script));
};

