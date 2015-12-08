var ast = require("../ast");
var H = require("../parse-helpers");
var _ = require("./whitespace")(null);

var spaced = H.spaced;
var word = H.word;

module.exports = function(ps) {
    var makeScript = ast.Script.bind(null, null);
    var makeModule = ast.Module.bind(null, null);
    var TopLevelStatement = _.then(ps.Statement).skip(ps.Terminator);
    var TopLevel = TopLevelStatement.many();
    var Script = TopLevel.map(makeScript);
    var Module = word("export").then(TopLevel).map(makeModule);
    // return spaced(Module.or(Script));
    return spaced(Script);
};

