var P = require("parsimmon");
var ast = require("./ast");

function cons(x, xs) {
    return [x].concat(xs);
}

function wrap(left, middle, right) {
    return left.then(middle).skip(right);
}

function spaced(par) {
    return wrap(_, par, _);
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

var Newline = P.regex(/\n/);
var NotNewlines = P.regex(/[^\n]*/);
var Comment = wrap(
    P.string("#"),
    NotNewlines,
    Newline.or(P.eof)
);
var _ = P.whitespace.or(Comment).many();

var TopExpr = P.lazy(function() {
    return P.alt(
        Block,
        If,
        Let,
        Try,
        Throw,
        Error,
        // Match,
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
        Array,
        Object,
        Function,
        IdentExpr,
        ParenExpr
    );
});

var Expr = TopExpr.or(BottomExpr);

var ParenExpr =
    P.string("(").skip(_)
    .then(Expr)
    .skip(P.string(")").skip(_));

var Literal = P.lazy("literal", function() {
    return P.alt(
        Number,
        String,
        True,
        False,
        Undefined,
        Null
    );
});

var Separator = spaced(P.string(","));
var Terminator = spaced(P.string(";"));

// TODO: Disallow keywords as identifiers.
var Identifier = P.regex(/[a-z][a-z0-9]*/i)
    .map(ast.Identifier);

var IdentExpr = Identifier.map(ast.IdentifierExpression);

var ArgList =
    word("(")
    .then(list0(Separator, Expr))
    .skip(word(")"));
var Call = P.seq(
    BottomExpr,
    ArgList.atLeast(1)
).map(spread(foldLeft(ast.Call)));

var DotProp =
    word(".")
    .then(Identifier)
    .map(function(x) { return x.data; })
    .map(ast.String);
var BracketProp = wrap(
    P.string("["),
    spaced(Expr),
    P.string("]")
);
var GetProperty = P.seq(
    BottomExpr,
    _.then(P.alt(DotProp, BracketProp)).atLeast(1)
).map(spread(foldLeft(ast.GetProperty)));

// TODO: Allow computed fields via [] form.
var CallMethod = P.seq(
    BottomExpr,
    P.seq(
        _.then(P.alt(DotProp, BracketProp)),
        _.then(ArgList)
    ).atLeast(1)
).map(spread(foldLeft(function(acc, x) {
    return ast.CallMethod(acc, x[0], x[1]);
})));

var GetMethod = P.seq(
    BottomExpr,
    _.then(word("::").then(Identifier)).atLeast(1)
).map(spread(foldLeft(ast.GetMethod)));

var Parameter = Identifier.map(ast.Parameter);
var Parameters = list0(Separator, Parameter);
var Function = P.seq(
    word("fn").then(word("(")).then(Parameters),
    word(")").then(Expr)
).map(spread(ast.Function));

var Statement = Expr.skip(Terminator);
var Block =
    word("do")
    .then(word("{"))
    .then(Statement.atLeast(1))
    .skip(word("}"))
    .map(ast.Block);

var If = P.seq(
    word("if").then(word("(")).then(Expr),
    word(")").then(Expr).skip(_),
    word("else").then(Expr)
).map(spread(ast.If));

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

var b6 = lbo("* /", OtherOpExpr);
var b5 = lbo("+ -", b6);
var b4 = lbo("++ ~", b5);
var b3 = lbo("> >= < <= = !=", b4);
var b2 = lbo("and or", b3);
var b1 = lbo("|>", b2);

var BinExpr = b1;
BottomExpr
var Try = word("try").then(Expr).map(ast.Try);
var Throw = word("throw").then(Expr).map(ast.Throw);
var Error = word("error").then(Expr).map(ast.Error);

var Binding = P.seq(
    Identifier.skip(_),
    word("=").then(Expr)
).map(spread(ast.Binding));
var Bindings = list1(Separator, Binding);
var Let = P.seq(
    word("let").then(word("(")).then(Bindings),
    word(")").then(Expr)
).map(spread(ast.Let));

var ObjectPairNormal = P.seq(
    Expr,
    spaced(P.string(":")).then(Expr)
).map(spread(ast.Pair));
var ObjectPairShorthand = Identifier
    .map(function(i) {
        return ast.Pair(ast.String(i.data), i);
    });
var ObjectPair = ObjectPairNormal.or(ObjectPairShorthand);
var ObjectPairs = list0(Separator, ObjectPair);
var Object = wrap(
    P.string("{").then(_),
    ObjectPairs,
    _.then(P.string("}"))
).map(ast.Map);

var Array = wrap(
    P.string("[").skip(_),
    list0(Separator, Expr),
    _.then(P.string("]"))
).map(ast.List);

var True = P.string("true").result(ast.True());
var False = P.string("false").result(ast.False());
var Null = P.string("null").result(ast.Null());
var Undefined = P.string("undefined").result(ast.Undefined());

var Number = P.regex(/[0-9]+/)
    .desc("number")
    .map(global.Number)
    .map(ast.Number);

var DoubleQuote = P.string('"');
var StringChars = P.regex(/[^"\n]*/);
var String = wrap(DoubleQuote, StringChars, DoubleQuote)
    .desc("string")
    .map(ast.String);

var Script = spaced(Expr).map(spread(ast.Script));
var Module = P.alt(
    spaced(word("export").then(Expr)).map(ast.Module),
    Script
);

module.exports = {
    // GET RID OF THIS
    CallMethod: CallMethod,
    GetProperty: GetProperty,
    // GET RID OF THIS

    Module: Module,
    Expr: Expr,
    Binding: Binding,
    spaced: spaced,
    _: _
};
