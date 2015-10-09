var P = require("parsimmon");

module.exports = function(ps) {
    var ObjectPairKey =
        P.alt(
            ps.IdentifierAsString,
            ps.String_,
            ps.ParenExpr
        );

    return ObjectPairKey;
};
