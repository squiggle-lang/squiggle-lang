var ast = require("../ast");
var H = require("../parse-helpers");

var spaced = H.spaced;
var word = H.word;

module.exports = function(ps) {
    // var Script = ione(ast.Script, ps.Expr);
    // var Module = ione(ast.Module, word("export").then(ps.Expr));
    // return spaced(Module.or(Script));
    var Script = ps.Expr.map(ast.Script.bind(null, null));
    var Module = word("export").then(ps.Expr).map(ast.Module.bind(null, null));
    return spaced(Module.or(Script));
};

