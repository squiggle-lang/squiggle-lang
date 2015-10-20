var ast = require("../ast");
var H = require("../parse-helpers");

var spaced = H.spaced;
var word = H.word;

module.exports = function(ps) {
    var Script = ps.Expr.map(ast.Script.bind(null, null));
    var Module = word("export").then(ps.Expr).map(ast.Module.bind(null, null));
    return spaced(Module.or(Script));
};

