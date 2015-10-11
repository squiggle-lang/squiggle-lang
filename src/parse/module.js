var ast = require("../ast");
var H = require("../parse-helpers");

var spaced = H.spaced;
var word = H.word;

module.exports = function(ps) {
    var Script = ps.Expr.map(ast.Script);
    var Module = word("export")
        .then(ps.Expr)
        .map(ast.Module)
        .or(Script);
    return spaced(Module);
};

