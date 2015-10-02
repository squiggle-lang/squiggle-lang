var last = require('lodash/array/last');

function _walk(parents, obj, ast) {
    var enter = obj.enter || function() {};
    var exit = obj.exit || function() {};
    var recur = _walk.bind(null, parents, obj);
    var handlers = {
        Module: function(node) {
            recur(node.expr);
        },
        Script: function(node) {
            recur(node.expr);
        },
        GetProperty: function(node) {
            recur(node.obj);
            recur(node.prop);
        },
        GetMethod: function(node) {
            recur(node.obj);
            recur(node.prop);
        },
        CallMethod: function(node) {
            recur(node.obj);
            recur(node.prop);
            node.args.forEach(recur);
        },
        Call: function(node) {
            recur(node.f);
            node.args.forEach(recur);
        },
        Function: function(node) {
            recur(node.parameters);
            recur(node.body);
        },
        Parameters: function(node) {
            if (node.context) {
                recur(node.context);
            }
            node.positional.forEach(recur);
            if (node.slurpy) {
                recur(node.slurpy);
            }
        },
        Block: function(node) {
            node.expressions.forEach(recur);
        },
        If: function(node) {
            recur(node.p);
            recur(node.t);
            recur(node.f);
        },
        Let: function(node) {
            node.bindings.forEach(recur);
            recur(node.expr);
        },
        Binding: function(node) {
            recur(node.identifier);
            recur(node.value);
        },
        Array: function(node) {
            node.data.forEach(recur);
        },
        Object: function(node) {
            node.data.forEach(recur);
        },
        BinOp: function(node) {
            recur(node.operator);
            recur(node.left);
            recur(node.right);
        },
        Parameter: function(node) {
            recur(node.identifier);
        },
        Pair: function(node) {
            recur(node.key);
            recur(node.value);
        },
        IdentifierExpression: function(node) {
            recur(node.data);
        },
        ReplExpression: function(node) {
            recur(node.expression);
        },
        ReplBinding: function(node) {
            recur(node.binding);
        },
        Match: function(node) {
            recur(node.expression);
            node.clauses.forEach(recur);
        },
        MatchClause: function(node) {
            recur(node.pattern);
            recur(node.expression);
        },
        MatchPatternSimple: function(node) {
            recur(node.identifier);
        },
        MatchPatternParenExpr: function(node) {
            recur(node.expr);
        },
        MatchPatternLiteral: function(node) {
            recur(node.data);
        },
        MatchPatternArray: function(node) {
            node.patterns.forEach(recur);
        },
        MatchPatternArraySlurpy: function(node) {
            node.patterns.forEach(recur);
            recur(node.slurp);
        },
        MatchPatternObject: function(node) {
            node.pairs.forEach(recur);
        },
        MatchPatternObjectPair: function(node) {
            recur(node.key);
            recur(node.value);
        },
        Error: function(node) {
            recur(node.message);
        },
        Throw: function(node) {
            recur(node.exception);
        },
        Try: function(node) {
            recur(node.expr);
        },
        Require: function(node) {
            recur(node.expr);
        },
        Not: function(node) {
            recur(node.expr);
        },
        Negate: function(node) {
            recur(node.expr);
        },
        True: function(node) {},
        False: function(node) {},
        Null: function(node) {},
        Undefined: function(node) {},
        Operator: function(node) {},
        Identifier: function(node) {},
        Number: function(node) {},
        String: function(node) {},
    };
    var shouldSkip = enter(ast, last(parents)) === SKIP;
    if (!(ast.type in handlers)) {
        throw new Error('unknown AST node type ' + JSON.stringify(ast));
    }
    if (!shouldSkip) {
        parents.push(ast);
        handlers[ast.type](ast);
        parents.pop();
    }
    exit(ast, last(parents));
}

function walk(obj, ast) {
    return _walk([], obj, ast);
}

var SKIP = "SKIP";

module.exports = {
    walk: walk,
    SKIP: SKIP
};
