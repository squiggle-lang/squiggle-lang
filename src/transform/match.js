var esprima = require("esprima");

var es = require("../es");

function Match(transform, node) {
    var e = transform(node.expression);
    var body = node.clauses.map(matchClause.bind(null, transform));
    var matchError = esprima.parse(
        "throw new Error('pattern match failure');"
    ).body;
    var block = es.BlockStatement(null, body.concat(matchError));
    var id = es.Identifier(null, "$match");
    var fn = es.FunctionExpression(null, null, [id], block);
    return es.CallExpression(node.loc, fn, [e]);
}

function matchClause(transform, node) {
    var e = transform(node.expression);
    return match(transform, node.pattern, e);
}

function match(transform, pattern, expression) {
    var id = es.Identifier(null, "$match");
    var expr = wrapExpression(transform, id, pattern, expression);
    var ret = es.ReturnStatement(expression.loc, expr);
    var pred = satisfiesPattern(transform, id, pattern);
    var block = es.BlockStatement(null, [ret]);
    return es.IfStatement(null, pred, block, null);
}

function esAnd(a, b) {
    return es.LogicalExpression(null, "&&", a, b);
}

function esEq(a, b) {
    return es.BinaryExpression(null, "===", a, b);
}

function esGe(a, b) {
    return es.BinaryExpression(null, ">=", a, b);
}

function esHas(a, b) {
    var prop = es.MemberExpression(null, true, a, b);
    var undef = es.Identifier(null, "undefined");
    return es.BinaryExpression(null, "!==", prop, undef);
}

function esSlice(xs, i) {
    var slice = es.Identifier(null, "$slice");
    return es.CallExpression(null, slice, [xs, i]);
}

function esProp(obj, prop) {
    return es.MemberExpression(null, false, obj, es.Identifier(null, prop));
}

function esNth(a, i) {
    return es.MemberExpression(null, true, a, es.Literal(null, i));
}

function esNth2(a, i) {
    return es.MemberExpression(null, true, a, i);
}

function objGet2(obj, k) {
    return es.MemberExpression(null, true, obj, k);
}

// var matchTmp = es.Identifier("$_");

// function assignTemp(expr) {
//     return es.AssignmentExpression("=", matchTmp, expr);
// }

var j = JSON.stringify;

function notEsTrue(x) {
    return !isEsTrue(x);
}

function isEsTrue(x) {
    return x.type === "Literal" && x.value === true;
}

var _satisfiesPattern = {
    MatchPatternSimple: function(transform, root, p) {
        return es.Literal(p.loc, true);
    },
    MatchPatternLiteral: function(transform, root, p) {
        var lit = transform(p.data);
        return es.CallExpression(
            p.loc, es.Identifier(null, "$is"), [root, lit]);
    },
    MatchPatternParenExpr: function(transform, root, p) {
        var expr = transform(p.expr);
        return es.CallExpression(
            null, es.Identifier(null, "$eq"), [root, expr]);
    },
    MatchPatternArray: function(transform, root, p) {
        var ps = p.patterns;
        var n = ps.length;
        var lengthEq = esEq(esProp(root, "length"), es.Literal(null, n));
        return ps
            .map(function(x, i) {
                return satisfiesPattern(transform, esNth(root, i), x);
            })
            .filter(notEsTrue)
            .reduce(esAnd, esAnd(root, lengthEq));
    },
    MatchPatternArraySlurpy: function(transform, root, p) {
        var ps = p.patterns;
        var n = es.Literal(null, ps.length);
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
        var id = es.Identifier(null, "$isObject");
        var isObject = es.CallExpression(null, id, [root]);
        return p
            .pairs
            .map(function(x) {
                return satisfiesPattern(transform, root, x);
            })
            .filter(notEsTrue)
            .reduce(esAnd, isObject);
    },
    MatchPatternObjectPair: function(transform, root, p) {
        var expr = transform(p.key);
        var has = esHas(root, expr);
        var rootObj = esNth2(root, expr);
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
    MatchPatternSimple: function(transform, acc, root, p) {
        if (p.identifier.data !== "_") {
            acc.identifiers.push(transform(p.identifier));
            acc.expressions.push(root);
        }
        return acc;
    },
    MatchPatternLiteral: function(transform, acc, root, p) {
        // Literals are just for the expression, they don't bind any values.
        return acc;
    },
    MatchPatternParenExpr: function(transform, acc, root, p) {
        // We've already checked the values match, nothing to bind.
        return acc;
    },
    MatchPatternArray: function(transform, acc, root, p) {
        p.patterns.forEach(function(x, i) {
            _pluckPattern(transform, acc, esNth(root, i), x);
        });
        return acc;
    },
    MatchPatternArraySlurpy: function(transform, acc, root, p) {
        p.patterns.forEach(function(x, i) {
            _pluckPattern(transform, acc, esNth(root, i), x);
        });
        var n = es.Literal(null, p.patterns.length);
        _pluckPattern(transform, acc, esSlice(root, n), p.slurp);
        return acc;
    },
    MatchPatternObject: function(transform, acc, root, p) {
        p.pairs.forEach(function(v) {
            _pluckPattern(transform, acc, root, v);
        });
        return acc;
    },
    MatchPatternObjectPair: function(transform, acc, root, p) {
        // TODO: Don't assume p.key is a string literal.
        var objRoot = objGet2(root, transform(p.key));
        _pluckPattern(transform, acc, objRoot, p.value);
        return acc;
    },
};

function _pluckPattern(transform, acc, root, p) {
    if (p && p.type in __pluckPattern) {
        return __pluckPattern[p.type](transform, acc, root, p);
    }
    throw new Error("can't pluckPattern of " + j(p));
}

function pluckPattern(transform, root, p) {
    var obj = {identifiers: [], expressions: []};
    return _pluckPattern(transform, obj, root, p);
}

function wrapExpression(transform, root, p, e) {
    var obj = pluckPattern(transform, root, p);
    var ret = es.ReturnStatement(e.loc, e);
    var block = es.BlockStatement(null, [ret]);
    var fn = es.FunctionExpression(null, null, obj.identifiers, block);
    return es.CallExpression(null, fn, obj.expressions);
}

module.exports = Match;
