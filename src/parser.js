var P = require("parsimmon");

var ast = require("./ast");
var H = require("./parse-helpers");
var parsimmonSalad = require("./parsimmon-salad");

var cons = H.cons;
var wrap = H.wrap;
var spaced = H.spaced;
var word = H.word;
var spread = H.spread;
var list0 = H.list0;
var list1 = H.list1;
var foldLeft = H.foldLeft;

var ps = {
    Expr: function(ps) {
        return P.alt(
            ps.Block,
            ps.If,
            ps.Let,
            ps.Try,
            ps.Throw,
            ps.Require,
            ps.Error_,
            ps.Match,
            ps.BinExpr,
            ps.Literal
        );
    },
    Literal: function(ps) {
        return P.alt(
            ps.BasicLiteral,
            ps.Array_,
            ps.Object_,
            ps.Function_,
            ps.IdentExpr,
            ps.ParenExpr
        ).desc("literal");
    },
    ParenExpr: function(ps) {
        return wrap("(", ps.Expr, ")");
    },

    BasicLiteral: function(ps) {
        return P.alt(
            ps.Number_,
            ps.String_,
            ps.NamedLiteral
        );
    },

    _: require("./parse/whitespace"),
    If: require("./parse/if"),
    Number_: require("./parse/number"),
    String_: require("./parse/string"),
    Parameters: require("./parse/parameters"),
    Function_: require("./parse/function"),
    UnaryOps: require("./parse/unary-ops"),
    BinExpr: require("./parse/bin-expr"),
    Let: require("./parse/let"),
    CallOrGet: require("./parse/call-or-get"),
    Identifier: require("./parse/identifier"),
    Match: require("./parse/match"),
    Block: require("./parse/block"),
    Object_: require("./parse/object"),
    Array_: require("./parse/array"),
    IdentifierAsString: require("./parse/identifier-as-string"),
    ObjectPairKey: require("./parse/object-pair-key"),
    Module: require("./parse/module"),
    NamedLiteral: require("./parse/named-literal"),

    /// It's always ok to have whitespace on either side of commas and
    /// semicolons. Also, this may eventually have more complicated rules,
    /// allowing for newlines instead of visible characters.
    Separator: function(ps) {
        return spaced(P.string(","));
    },
    Terminator: function(ps) {
        return spaced(P.string(";"));
    },

    /// I'm not incredibly a fan of having IdentExpr, but it helps the linter
    /// know when an identifier is being used for its name vs when it's being
    /// used for the value it references.
    IdentExpr: function(ps) {
        return ps.Identifier
            .map(ast.IdentifierExpression);
    },

    /// Various single word "unary operators".
    /// These all happen before binary operators are parsed.
    Try: function(ps) {
        return word("try").then(ps.Expr).map(ast.Try);
    },
    Throw: function(ps) {
        return word("throw").then(ps.Expr).map(ast.Throw);
    },
    Error_: function(ps) {
        return word("error").then(ps.Expr).map(ast.Error);
    },
    Require: function(ps) {
        return word("require").then(ps.Expr).map(ast.Require);
    },

};

module.exports = parsimmonSalad(ps);
