var es = require("./es");

function match(pattern, expression) {
    return es.IfStatement(
        satisfiesPattern(pattern),
        es.ReturnStatement(
            wrapExpression(pattern, expression)
        ),
        null
    );
}

function esAnd(a, b) {
    return es.LogicalExpression("&&", a, b);
}

function esEq(a, b) {
    return es.BinaryExpression("===", a, b);
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

var esTrue = es.Literal(true);

var _satisfiesPattern = {
    MatchPatternSimple: function(p) {
        var x = es.Literal(p.identifier.data);
        return esEq(x, x)
    },
    MatchPatternArray: function(p) {
        if (p.patterns.length === 0) {
            return esTrue;
        }
        var ps = p.patterns;
        var n = ps.length;
        var id = es.Identifier("$match");
        var lengthEq = esEq(esProp(id, "length"), es.Literal(n));
        return ps
            .map(satisfiesPattern)
            .reduce(esAnd, lengthEq);
    },
    MatchPatternObject: function(p) {
        if (p.pairs.length === 0) {
            return esTrue;
        }
        return p.pairs.map(satisfiesPattern).reduce(esAnd);
    },
    MatchPatternObjectPair: function(p) {
        // TODO: Don't assume the key is a string literal.
        var s = es.Literal(p.key.data);
        return esEq(s, s);
    },
};

function satisfiesPattern(p) {
    if (p.type in _satisfiesPattern) {
        return _satisfiesPattern[p.type](p);
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
        console.error(p);
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

function pluckPattern(p) {
    var obj = {identifiers: [], expressions: []};
    var root = es.Identifier("$match");
    return _pluckPattern(obj, root, p);
}

function wrapExpression(p, e) {
    var obj = pluckPattern(p);
    var ret = es.ReturnStatement(e);
    var block = es.BlockStatement([ret]);
    var fn = es.FunctionExpression(null, obj.identifiers, block);
    return es.CallExpression(fn, obj.expressions);
}

module.exports = match;
