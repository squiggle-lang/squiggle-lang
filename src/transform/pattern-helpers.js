var flatten = require("lodash/array/flatten");

var es = require("../es");

function pluckPattern(transform, root, p) {
    var obj = {identifiers: [], expressions: []};
    return _pluckPattern(transform, obj, root, p);
}

function satisfiesPattern(transform, root, p) {
    var conditions = satisfiesPattern2(transform, root, p);
    if (conditions.length === 0) {
        return es.Literal(null, true);
    }
    return conditions.reduce(esAnd);
}

function satisfiesPattern2(transform, root, p) {
    if (p && p.type in _satisfiesPattern) {
        return _satisfiesPattern[p.type](transform, root, p);
    }
    throw new Error("can't satisfiesPattern2 of " + j(p));
}

function esAnd(a, b) {
    return es.LogicalExpression(null, "&&", a, b);
}

function esEq(a, b) {
    return es.BinaryExpression(null, "===", a, b);
}

function notNullish(a) {
    return es.BinaryExpression(null, "!=", a, es.Literal(null, null));
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

var j = JSON.stringify;

var _satisfiesPattern = {
    PatternSimple: function(transform, root, p) {
        return [];
    },
    PatternLiteral: function(transform, root, p) {
        var lit = transform(p.data);
        var is = es.Identifier(null, "$is");
        var call = es.CallExpression(p.loc, is, [root, lit]);
        return [call];
    },
    PatternParenExpr: function(transform, root, p) {
        var expr = transform(p.expr);
        var eq = es.Identifier(null, "$eq");
        var call = es.CallExpression(null, eq, [root, expr]);
        return [call];
    },
    PatternArray: function(transform, root, p) {
        var ps = p.patterns;
        var n = ps.length;
        var checkLength = esEq(esProp(root, "length"), es.Literal(null, n));
        var checkNormal =
            ps.map(function(x, i) {
                return satisfiesPattern2(transform, esNth(root, i), x);
            });
        return flatten([checkLength, flatten(checkNormal)]);
    },
    PatternArraySlurpy: function(transform, root, p) {
        var ps = p.patterns;
        var n = es.Literal(null, ps.length);
        var atLeastLength = esGe(esProp(root, "length"), n);
        var checkLength = esAnd(notNullish(root), atLeastLength);
        var checkNormal =
            ps.map(function(x, i) {
                return satisfiesPattern2(transform, esNth(root, i), x);
            });
        var checkSlurpy =
            satisfiesPattern2(transform, esSlice(root, n), p.slurp);
        return flatten([
            checkLength,
            flatten(checkNormal),
            checkSlurpy
        ]);
    },
    PatternObject: function(transform, root, p) {
        var checkPairs =
            p.pairs.map(function(x) {
                return satisfiesPattern2(transform, root, x);
            });
        return flatten([notNullish(root), flatten(checkPairs)]);
    },
    PatternObjectPair: function(transform, root, p) {
        var expr = transform(p.key);
        var has = esHas(root, expr);
        var rootObj = esNth2(root, expr);
        var checkValue = satisfiesPattern2(transform, rootObj, p.value);
        return flatten([has, checkValue]);
    },
};

var __pluckPattern = {
    PatternSimple: function(transform, acc, root, p) {
        if (p.identifier.data !== "_") {
            acc.identifiers.push(transform(p.identifier));
            acc.expressions.push(root);
        }
        return acc;
    },
    PatternLiteral: function(transform, acc, root, p) {
        // Literals are just for the expression, they don't bind any values.
        return acc;
    },
    PatternParenExpr: function(transform, acc, root, p) {
        // We've already checked the values match, nothing to bind.
        return acc;
    },
    PatternArray: function(transform, acc, root, p) {
        p.patterns.forEach(function(x, i) {
            _pluckPattern(transform, acc, esNth(root, i), x);
        });
        return acc;
    },
    PatternArraySlurpy: function(transform, acc, root, p) {
        p.patterns.forEach(function(x, i) {
            _pluckPattern(transform, acc, esNth(root, i), x);
        });
        var n = es.Literal(null, p.patterns.length);
        _pluckPattern(transform, acc, esSlice(root, n), p.slurp);
        return acc;
    },
    PatternObject: function(transform, acc, root, p) {
        p.pairs.forEach(function(v) {
            _pluckPattern(transform, acc, root, v);
        });
        return acc;
    },
    PatternObjectPair: function(transform, acc, root, p) {
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

module.exports = {
    pluckPattern: pluckPattern,
    satisfiesPattern: satisfiesPattern
};
