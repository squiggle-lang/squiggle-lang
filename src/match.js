var es = require("./es");
var ast = require("./ast");

function match(pattern, expression) {
    var id = es.Identifier("$match");
    var expr = wrapExpression(id, pattern, expression);
    var ret = es.ReturnStatement(expr);
    var pred = satisfiesPattern(id, pattern);
    var block = es.BlockStatement([ret]);
    return es.IfStatement(pred, block, null);
}

function esAnd(a, b) {
    return es.LogicalExpression("&&", a, b);
}

function esEq(a, b) {
    return es.BinaryExpression("===", a, b);
}
function esIn(a, b) {
    return es.BinaryExpression("in", a, b);
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

function esTypeof(x) {
    return {
        type: "UnaryExpression",
        prefix: true,
        operator: "typeof",
        argument: x,
    };
}

var esTrue = es.Literal(true);

function notEsTrue(x) {
    return !isEsTrue(x);
}

function isEsTrue(x) {
    return x.type === "Literal" && x.value === true;
}

var _satisfiesPattern = {
    MatchPatternSimple: function(root, p) {
        return esTrue;
    },
    MatchPatternLiteral: function(root, p) {
        var lit = es.Literal(p.data.data);
        return es.CallExpression(es.Identifier("sqgl$$is"), [root, lit]);
    },
    MatchPatternArray: function(root, p) {
        var ps = p.patterns;
        var n = ps.length;
        var lengthEq = esEq(esProp(root, "length"), es.Literal(n));
        return ps
            .map(function(x, i) {
                return satisfiesPattern(esNth(root, i), x);
            })
            .filter(notEsTrue)
            .reduce(esAnd, esAnd(root, lengthEq));
    },
    MatchPatternObject: function(root, p) {
        var t = esTypeof(root);
        var o = es.Literal("object");
        var isObject = es.CallExpression(
            es.Identifier("sqgl$$isObject"),
            [root]
        );
        return p
            .pairs
            .map(function(x) {
                return satisfiesPattern(root, x);
            })
            .filter(notEsTrue)
            .reduce(esAnd, isObject);
    },
    MatchPatternObjectPair: function(root, p) {
        // TODO: Don't assume the key is a string literal.
        var has = esIn(es.Literal(p.key.data), root);
        var rootObj = esNth(root, p.key.data);
        return esAnd(has, satisfiesPattern(rootObj, p.value));
    },
};

function satisfiesPattern(root, p) {
    if (p.type in _satisfiesPattern) {
        return _satisfiesPattern[p.type](root, p);
    }
    throw new Error("can't satisfiesPattern of " + j(p));
}

var __pluckPattern = {
    MatchPatternSimple: function(acc, root, p) {
        acc.identifiers.push(es.Identifier(p.identifier.data));
        acc.expressions.push(root);
        return acc;
    },
    MatchPatternLiteral: function(acc, root, p) {
        // Literals are just for the expression, they don't bind any values.
        return acc;
    },
    MatchPatternArray: function(acc, root, p) {
        p.patterns.forEach(function(x, i) {
            _pluckPattern(acc, esNth(root, i), x);
        });
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

module.exports = match;
