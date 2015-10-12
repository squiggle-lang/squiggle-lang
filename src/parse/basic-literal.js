var P = require("parsimmon");

module.exports = function(ps) {
    var BasicLiteral =
        P.alt(
            ps.Number,
            ps.String,
            ps.NamedLiteral
        );
    return BasicLiteral;
};
