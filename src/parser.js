var P = require("parsimmon");

var ast = require("./ast");

var H = require("./parse-helpers");
var cons = H.cons;
var wrap = H.wrap;
var spaced = H.spaced;
var word = H.word;
var spread = H.spread;
var list0 = H.list0;
var list1 = H.list1;
var foldLeft = H.foldLeft;

var ps = {
    /// High level view of expressions. It starts with TopExpr which eventually
    /// delegates down to BinExpr. BinExpr are composed of binary operators with
    /// ps.OtherOpExpr on either side. ps.OtherOpExpr are the middle tier of things
    /// that don't really look like operators but kinda are, like function
    /// application, method calls, etc. Finally, this delegates down to
    /// BottomExpr, which is the basic literals of the language, and ParenExpr
    /// which goes back up to TopExpr.
    TopExpr: function(ps) {
        return P.alt(
            ps.Block,
            ps.If,
            ps.Let,
            ps.Try,
            ps.Throw,
            ps.Require,
            ps.Error_,
            ps.Match,
            ps.BinExpr
        );
    },
    OtherOpExpr: function(ps) {
        return P.alt(
            ps.CallOrGet,
            ps.BottomExpr
        );
    },
    BottomExpr: function(ps) {
        return P.alt(
            ps.Literal,
            ps.Array_,
            ps.Object_,
            ps.Function_,
            ps.IdentExpr,
            ps.ParenExpr
        ).desc("literal");
    },
    Expr: function(ps) {
        return ps.TopExpr.or(ps.BottomExpr);
    },
    ParenExpr: function(ps) {
        return wrap("(", ps.Expr, ")");
    },

    Literal: function(ps) {
        return P.alt(
            ps.Number_,
            ps.String_,
            ps.True,
            ps.False,
            ps.Undefined,
            ps.Null
        );
    },


    /// Named literals.
    True: function(ps) {
        return P.string("true").result(ast.True())
    },
    False: function(ps) {
        return P.string("false").result(ast.False())
    },
    Null: function(ps) {
        return P.string("null").result(ast.Null())
    },
    Undefined: function(ps) {
        return P.string("undefined").result(ast.Undefined())
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

    /// Top level file entry point.
    Script: function(ps) {
        return spaced(ps.Expr)
            .map(ast.Script);
    },
    Module: function(ps) {
        return spaced(word("export").then(ps.Expr))
            .map(ast.Module)
            .or(ps.Script);
    },

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

    /// Function calls, method calls, property access, and method access are all
    /// the same precedence level. It makes this section a little dense.
    ArgList: function(ps) {
        return wrap("(", list0(ps.Separator, ps.Expr), ")");
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

Object.keys(ps).forEach(function(k) {
    var f = ps[k];
    var g = f.bind(null, ps);
    g.toString = function() {
        return f.toString();
    };
    ps[k] = P.lazy(g);
});

Object.freeze(ps);

ps.spaced = spaced;
module.exports = ps;
