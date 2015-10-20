var ast = require("../ast");

module.exports = function(ps) {
    return ps.Identifier
        .map(function(node) {
            return ast.String(node.index, node.data);
        });
};
