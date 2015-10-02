var esprima = require("esprima");

var es = require("../es");

function Match(transform, node) {
    var e = transform(node.expression);
    var body = node.clauses.map(matchClause.bind(null, transform));
    var matchError = esprima.parse(
        "throw new $Error('pattern match failure');"
    ).body;
    var block = es.BlockStatement(body.concat(matchError));
    var id = es.Identifier("$match");
    var fn = es.FunctionExpression(null, [id], block);
    return es.CallExpression(fn, [e]);
}

function matchClause(transform, node) {
    var e = transform(node.expression);
    return match(transform, node.pattern, e);
}

function match(transform, pattern, expression) {
    var id = es.Identifier("$match");
    var expr = wrapExpression(id, pattern, expression);
    var ret = es.ReturnStatement(expr);
    var pred = satisfiesPattern(transform, id, pattern);
    var block = es.BlockStatement([ret]);
    return es.IfStatement(pred, block, null);
}

function esAnd(a, b) {
    return es.LogicalExpression("&&", a, b);
}

function esEq(a, b) {
    return es.BinaryExpression("===", a, b);
}

function esGe(a, b) {
    return es.BinaryExpression(">=", a, b);
}

function esIn(a, b) {
    return es.BinaryExpression("in", a, b);
}

function esSlice(xs, i) {
    var slice = es.Identifier("$slice");
    return es.CallExpression(slice, [i, xs]);
}

function esProp(obj, prop) {
    return es.MemberExpression(false, obj, es.Identifier(prop));
}

function esNth(a, i) {
    return es.MemberExpression(true, a, es.Literal(i));
}

function objGet(obj, k) {
    return es.MemberExpression(true, obj, es.Literal(k));
}

var j = JSON.stringify;

var esTrue = es.Literal(true);

function notEsTrue(x) {
    return !isEsTrue(x);
}

function isEsTrue(x) {
    return x.type === "Literal" && x.value === true;
}

var _satisfiesPattern = {
    MatchPatternSimple: function(transform, root, p) {
        return esTrue;
    },
    MatchPatternLiteral: function(transform, root, p) {
        var lit = es.Literal(p.data.data);
        return es.CallExpression(es.Identifier("$is"), [root, lit]);
    },
    MatchPatternParenExpr: function(transform, root, p) {
        var expr = transform(p.expr);
        return es.CallExpression(es.Identifier("$eq"), [root, expr]);
    },
    MatchPatternArray: function(transform, root, p) {
        var ps = p.patterns;
        var n = ps.length;
        var lengthEq = esEq(esProp(root, "length"), es.Literal(n));
        return ps
            .map(function(x, i) {
                return satisfiesPattern(transform, esNth(root, i), x);
            })
            .filter(notEsTrue)
            .reduce(esAnd, esAnd(root, lengthEq));
    },
    MatchPatternArraySlurpy: function(transform, root, p) {
        var ps = p.patterns;
        var n = es.Literal(ps.length);
        var atLeastLength = esGe(esProp(root, "length"), n);
        var a = ps
            .map(function(x, i) {
                return satisfiesPattern(transform, esNth(root, i), x);
            })
            .filter(notEsTrue)
            .reduce(esAnd, esAnd(root, atLeastLength));
        var b = satisfiesPattern(transform, esSlice(root, n), p.slurp);
        return esAnd(a, b);
    },
    MatchPatternObject: function(transform, root, p) {
        var id = es.Identifier("$isObject");
        var isObject = es.CallExpression(id, [root]);
        return p
            .pairs
            .map(function(x) {
                return satisfiesPattern(transform, root, x);
            })
            .filter(notEsTrue)
            .reduce(esAnd, isObject);
    },
    MatchPatternObjectPair: function(transform, root, p) {
        // TODO: Don't assume the key is a string literal.
        var has = esIn(es.Literal(p.key.data), root);
        var rootObj = esNth(root, p.key.data);
        return esAnd(has, satisfiesPattern(transform, rootObj, p.value));
    },
};

function satisfiesPattern(transform, root, p) {
    if (p && p.type in _satisfiesPattern) {
        return _satisfiesPattern[p.type](transform, root, p);
    }
    throw new Error("can't satisfiesPattern of " + j(p));
}

var __pluckPattern = {
    MatchPatternSimple: function(acc, root, p) {
        if (p.identifier.data !== "_") {
            acc.identifiers.push(es.Identifier(p.identifier.data));
            acc.expressions.push(root);
        }
        return acc;
    },
    MatchPatternLiteral: function(acc, root, p) {
        // Literals are just for the expression, they don't bind any values.
        return acc;
    },
    MatchPatternParenExpr: function(acc, root, p) {
        // We've already checked the values match, nothing to bind.
        return acc;
    },
    MatchPatternArray: function(acc, root, p) {
        p.patterns.forEach(function(x, i) {
            _pluckPattern(acc, esNth(root, i), x);
        });
        return acc;
    },
    MatchPatternArraySlurpy: function(acc, root, p) {
        p.patterns.forEach(function(x, i) {
            _pluckPattern(acc, esNth(root, i), x);
        });
        var n = es.Literal(p.patterns.length);
        _pluckPattern(acc, esSlice(root, n), p.slurp);
        return acc;
    },
    MatchPatternObject: function(acc, root, p) {
        p.pairs.forEach(function(v) {
            _pluckPattern(acc, root, v);
        });
        return acc;
    },
    MatchPatternObjectPair: function(acc, root, p) {
        // TODO: Don't assume p.key is a string literal.
        var objRoot = objGet(root, p.key.data);
        _pluckPattern(acc, objRoot, p.value);
        return acc;
    },
};

function _pluckPattern(acc, root, p) {
    if (p.type in __pluckPattern) {
        return __pluckPattern[p.type](acc, root, p);
    }
    throw new Error("can't pluckPattern of " + j(p));
}

function pluckPattern(root, p) {
    var obj = {identifiers: [], expressions: []};
    return _pluckPattern(obj, root, p);
}

function wrapExpression(root, p, e) {
    var obj = pluckPattern(root, p);
    var ret = es.ReturnStatement(e);
    var block = es.BlockStatement([ret]);
    var fn = es.FunctionExpression(null, obj.identifiers, block);
    return es.CallExpression(fn, obj.expressions);
}

module.exports = Match;
