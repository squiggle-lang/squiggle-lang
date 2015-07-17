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
            node.parameters.forEach(recur);
            recur(node.body);
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
        List: function(node) {
            node.data.forEach(recur);
        },
        Map: function(node) {
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
        Operator: function(node) {},
        Identifier: function(node) {},
        Number: function(node) {},
        String: function(node) {},
    };
    var shouldSkip = enter(ast, last(parents)) === SKIP;
    if (!(ast.type in handlers)) {
        throw new Error('unknown AST node type ' + ast.type);
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
