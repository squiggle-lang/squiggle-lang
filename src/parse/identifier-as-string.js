var ast = require("../ast");

var ione = require("../parse-helpers").ione;

module.exports = function(ps) {
    return ione(ast.String, ps.Name);
};
