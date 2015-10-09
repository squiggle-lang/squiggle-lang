var ast = require("../ast");

module.exports = function(ps) {
    var IdentifierAsString =
        ps.Identifier
        .map(function(x) { return x.data; })
        .map(ast.String);

    return IdentifierAsString;
};
