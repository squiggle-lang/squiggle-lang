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

function arrayNth(a, i) {
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

var _satisfiesPattern = {
    MatchPatternSimple: function(root, p) {
        return esTrue;
    },
    MatchPatternArray: function(root, p) {
        var ps = p.patterns;
        var n = ps.length;
        var lengthEq = esEq(esProp(root, "length"), es.Literal(n));
        return lengthEq;
    },
    MatchPatternObject: function(root, p) {
        var t = esTypeof(root);
        var o = es.Literal("object");
        var isObject = esAnd(root, esEq(t, o));
        return p
            .pairs
            .map(function(p) {
                return esIn(es.Literal(p.key.data), root);
            })
            .reduce(esAnd, isObject);
    },
    MatchPatternObjectPair: function(root, p) {
        // TODO: Don't assume the key is a string literal.
        var s = es.Literal(p.key.data);
        return esEq(s, s);
    },
};

function satisfiesPattern(root, p) {
    if (p.type in _satisfiesPattern) {
        return _satisfiesPattern[p.type](root, p);
    }
    throw new Error("can't satisfiesPattern of " + p);
}

var __pluckPattern = {
    MatchPatternSimple: function(acc, root, p) {
        acc.identifiers.push(es.Identifier(p.identifier.data));
        acc.expressions.push(root);
        return acc;
    },
    MatchPatternArray: function(acc, root, p) {
        p.patterns.forEach(function(x, i) {
            _pluckPattern(acc, arrayNth(root, i), x);
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
        acc.identifiers.push(es.Identifier(p.value.data));
        acc.expressions.push(objGet(root, p.key.data));
        return acc;
    },
}

function _pluckPattern(acc, root, p) {
    if (p.type in __pluckPattern) {
        return __pluckPattern[p.type](acc, root, p);
    }
    throw new Error("can't pluckPattern of " + p);
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
