var P = require("parsimmon");
var flatten = require("lodash/array/flatten");
var ast = require("./ast");

function cons(x, xs) {
    if (arguments.length === 1) {
        return cons.bind(null, x);
    }
    return [x].concat(xs);
}

function wrap(left, middle, right) {
    return P.string(left)
        .then(_)
        .then(middle)
        .skip(_)
        .skip(P.string(right));
}

function spaced(par) {
    return _.then(par).skip(_);
}

function word(str) {
    return P.string(str).skip(_);
}

function spread(f) {
    return function(xs) {
        return f.apply(null, xs);
    };
}

function list0(sep, par) {
    return list1(sep, par).or(P.of([]));
}

function list1(sep, par) {
    var more = sep.then(par).many();
    return par.chain(function(r) {
        return more.map(function(rs) {
            return cons(r, rs);
        });
    });
}

function foldLeft(f) {
    return function(z, xs) {
        return xs.reduce(function(acc, x) {
            return f(acc, x);
        }, z);
    };
}

/// Basic whitespace stuff.

var Newline = P.regex(/\n/);

var NotNewlines = P.regex(/[^\n]*/);

var Comment =
    P.string("#")
    .then(NotNewlines)
    .skip(Newline.or(P.eof));

var _ = P.whitespace.or(Comment).many();

/// High level view of expressions. It starts with TopExpr which eventually
/// delegates down to BinExpr. BinExpr are composed of binary operators with
/// OtherOpExpr on either side. OtherOpExpr are the middle tier of things that
/// don't really look like operators but kinda are, like function application,
/// method calls, etc. Finally, this delegates down to BottomExpr, which is the
/// basic literals of the language, and ParenExpr which goes back up to TopExpr.

var TopExpr = P.lazy(function() {
    return P.alt(
        Block,
        If,
        Let,
        Try,
        Throw,
        Error_,
        Match,
        BinExpr
    );
});

var OtherOpExpr = P.lazy(function() {
    return P.alt(
        CallMethod,
        Call,
        GetProperty,
        GetMethod,
        BottomExpr
    );
});

var BottomExpr = P.lazy(function() {
    return P.alt(
        Literal,
        Array_,
        Object_,
        Function_,
        IdentExpr,
        ParenExpr
    );
});

var Expr = TopExpr.or(BottomExpr);

var ParenExpr = wrap("(", Expr, ")");

var Literal = P.lazy("literal", function() {
    return P.alt(
        Number_,
        String_,
        True,
        False,
        Undefined,
        Null
    );
});

/// It's always ok to have whitespace on either side of commas and semicolons.
/// Also, this may eventually have more complicated rules, allowing for newlines
/// instead of visible characters.

var Separator = spaced(P.string(","));
var Terminator = spaced(P.string(";"));

// TODO: Disallow keywords as identifiers.
var Identifier =
    P.regex(/[_a-z][_a-z0-9]*/i)
    .desc("identifier")
    .map(ast.Identifier);

/// I'm not incredibly a fan of having IdentExpr, but it helps the linter know
/// when an identifier is being used for its name vs when it's being used for
/// the value it references.

var IdentExpr =
    Identifier
    .map(ast.IdentifierExpression);

/// Pattern matching section is kinda huge because it mirrors much of the rest
/// of the language, but produces different AST nodes, and is slightly
/// different.

var MatchPattern = P.lazy(function() {
    return P.alt(
        MatchPatternArray,
        MatchPatternObject,
        MatchPatternLiteral,
        MatchPatternSimple,
        MatchPatternParenExpr
    );
});

var MatchPatternSimple =
    Identifier.map(ast.MatchPatternSimple);

var MatchPatternParenExpr = P.lazy(function() {
    return ParenExpr.map(ast.MatchPatternParenExpr);
});

var MatchPatternLiteral = P.lazy(function() {
    return P.alt(
        Number_,
        String_,
        True,
        False,
        Undefined,
        Null
    ).map(ast.MatchPatternLiteral);
});

var MatchPatternObjectPairBasic = P.lazy(function() {
    return P.seq(
        ObjectPairKey.skip(_),
        word(":").then(MatchPattern)
    ).map(spread(ast.MatchPatternObjectPair));
});

var MatchPatternObjectPairShorthand =
    Identifier.map(function(i) {
        return ast.MatchPatternObjectPair(
            ast.String(i.data),
            ast.MatchPatternSimple(i)
        );
    });

var MatchPatternObjectPair = P.alt(
    MatchPatternObjectPairBasic,
    MatchPatternObjectPairShorthand
);

var MatchPatternObject =
    wrap("{", list0(Separator, MatchPatternObjectPair), "}")
    .map(ast.MatchPatternObject);

var MatchPatternArrayStrict =
    wrap("[", list0(Separator, MatchPattern), "]")
    .map(ast.MatchPatternArray);

var MatchPatternArraySlurpy =
    wrap(
        "[",
        P.seq(
            MatchPattern.skip(Separator).many(),
            word("...").then(MatchPattern)
        ),
        "]"
    ).map(spread(ast.MatchPatternArraySlurpy));

var MatchPatternArray = P.alt(
    MatchPatternArrayStrict,
    MatchPatternArraySlurpy
);

var MatchClause =
    P.seq(
        word("case").then(MatchPattern),
        _.then(word("=>")).then(Expr)
    ).map(spread(ast.MatchClause));

var Match =
    P.seq(
        word("match").then(Expr),
        _.then(MatchClause).atLeast(1).skip(_).skip(P.string("end"))
    ).map(spread(ast.Match));

/// Function calls.

var ArgList =
    wrap("(", list0(Separator, Expr), ")");

var Call =
    P.seq(BottomExpr, _.then(ArgList).atLeast(1))
    .map(spread(foldLeft(ast.Call)));

/// Dot access to properties is really just syntax sugar for using brackets and
/// a string literal, so let's treat it that way in the grammar. The compiler
/// can optimize that part.

var IdentifierAsString =
    Identifier
    .map(function(x) { return x.data; })
    .map(ast.String);

var DotProp =
    word(".")
    .then(IdentifierAsString);

var BracketProp =
    wrap("[", Expr, "]");

var Property = DotProp.or(BracketProp);

/// Property get and method calls.

var GetProperty =
    P.seq(
        BottomExpr,
        _.then(Property).atLeast(1)
    )
    .map(spread(foldLeft(ast.GetProperty)));

var CallMethod =
    P.seq(
        BottomExpr,
        P.seq(
            _.then(Property),
            _.then(ArgList)
        ).atLeast(1)
    ).map(spread(foldLeft(function(acc, x) {
        return ast.CallMethod(acc, x[0], x[1]);
    })));

/// Getting a bound method like `console::log`. Syntax is likely to change on
/// this to match the experimental ES7-style `::console.log` and
/// `::console["log"]`.

var GetMethod =
    P.seq(
        BottomExpr,
        _.then(word("::").then(IdentifierAsString)).atLeast(1)
    ).map(spread(foldLeft(ast.GetMethod)));

/// Function literals.

var Parameter =
    Identifier.map(ast.Parameter);

// Parameters look like this:
// (@this, a, b, c, ...xs)
// The first piece (@this) is the context.
// The second piece (a, b, c) is the positional.
// The third piece (...xs) is the slurpy.
// All pieces are optional.

var ParamSlurpy = word("...").then(Parameter);
var ParamContext = P.string("@").then(Parameter);
var ParamsPositional = list0(Separator, Parameter);

var Params2 =
    P.alt(
        P.seq(ParamsPositional, Separator.then(ParamSlurpy)),
        P.seq(P.of([]), ParamSlurpy),
        P.seq(ParamsPositional, P.of(null)),
        P.of(null)
    );

var Params1 =
    P.alt(
        ParamContext.chain(function(x) {
            return Separator.then(Params2.map(cons(x)));
        }),
        ParamContext.map(function(x) { return [x, [], null]; }),
        Params2.map(cons(null))
    );

var Parameters =
    Params1
    .map(spread(ast.Parameters));

var Function_ =
    P.seq(
        word("fn").then(Identifier.or(P.of(null))),
        _.then(wrap("(", Parameters, ")")),
        _.then(Expr)
    ).map(spread(ast.Function));

/// Code blocks start with "do" to avoid ambiguity with object literals.

var Statement =
    Expr.skip(Terminator);

var Block =
    wrap("do", Statement.atLeast(1), "end")
    .map(ast.Block);

/// If-expression with mandatory else clause.

var If =
    P.seq(
        word("if").then(Expr).skip(_),
        word("then").then(Expr).skip(_),
        word("else").then(Expr)
    ).map(spread(ast.If));

/// This helper is really dense, but basically it process a list of operators
/// and expressions, nesting them in a left-associative manner.

function lbo(ops, e) {
    var aOperators = ops.split(" ");
    var sOperators = aOperators.map(P.string).map(spaced);
    var pOperator = P.alt.apply(null, sOperators).map(ast.Operator);
    var pAll = P.seq(e, P.seq(pOperator, e).many());
    return pAll.map(function(data) {
        return data[1].reduce(function(acc, x) {
            return ast.BinOp(x[0], acc, x[1]);
        }, data[0]);
    });
}

/// Unary operators not (not) and negate (-).

var Not = word("not").then(OtherOpExpr).map(ast.Not);
var Negate = word("-").then(OtherOpExpr).map(ast.Negate);

var UnaryOps = P.alt(Not, Negate, OtherOpExpr);

var b6 = lbo("* /", UnaryOps);
var b5 = lbo("+ -", b6);
var b4 = lbo("++ ~", b5);
var b3 = lbo(">= <= < > == !=", b4);
var b2 = lbo("and or", b3);
var b1 = lbo("|>", b2);

var BinExpr = b1;

/// Various single word "unary operators".
/// These all happen before binary operators are parsed.

var Try = word("try").then(Expr).map(ast.Try);
var Throw = word("throw").then(Expr).map(ast.Throw);
var Error_ = word("error").then(Expr).map(ast.Error);

/// Variable bindings via "let". Probably going to be changed soon.

var LetBinding =
    P.seq(
        word("let").then(Identifier),
        _.then(word("=")).then(Expr)
    ).map(spread(ast.Binding));

var DefBinding =
    P.seq(
        word("def").then(Identifier).skip(_),
        _.then(wrap("(", Parameters, ")")).skip(_),
        word("=").then(Expr)
    ).map(spread(function(name, params, body) {
        var fn = ast.Function(name, params, body);
        return ast.Binding(name, fn);
    }));

var Binding = LetBinding.or(DefBinding);

var Bindings = list1(_, Binding);

var Let =
    P.seq(
        Bindings,
        _.then(word("in")).then(Expr)
    ).map(spread(ast.Let));

/// Object literal.

var ObjectPairKey = P.lazy(function() {
    return P.alt(
        IdentifierAsString,
        String_,
        ParenExpr
    );
});

var ObjectPairNormal =
    P.seq(
        ObjectPairKey,
        spaced(P.string(":")).then(Expr)
    ).map(spread(ast.Pair));

var ObjectPairShorthand =
    Identifier
    .map(function(i) {
        return ast.Pair(ast.String(i.data), i);
    });

var ObjectPair = P.alt(
    ObjectPairNormal,
    ObjectPairShorthand
);

var Object_ =
    wrap("{", list0(Separator, ObjectPair), "}")
    .map(ast.Object);

/// Array literal.

var Array_ =
    wrap("[", list0(Separator, Expr), "]")
    .map(ast.Array);

/// Named literals.

var True = P.string("true").result(ast.True());
var False = P.string("false").result(ast.False());
var Null = P.string("null").result(ast.Null());
var Undefined = P.string("undefined").result(ast.Undefined());

/// Numbers.

var Number_ = P.regex(/[0-9]+/)
    .desc("number")
    .map(global.Number)
    .map(ast.Number);

/// Strings.

var DQuote = P.string('"');

var StringChars = P.regex(/[^"\n]*/);

var String_ =
    DQuote.then(StringChars).skip(DQuote)
    .desc("string")
    .map(ast.String);

/// Top level file entry point.

var Script =
    spaced(Expr)
    .map(ast.Script);

var Module =
    spaced(word("export").then(Expr))
    .map(ast.Module)
    .or(Script);

module.exports = {
    Module: Module,
    Expr: Expr,
    Binding: Binding,
    spaced: spaced,
    _: _
};
