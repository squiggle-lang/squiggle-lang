var isObject = require("lodash/lang/isObject");
var flatten = require("lodash/array/flatten");
var fs = require("fs");
var path = require("path");
var jsbeautify = require("js-beautify");
var esprima = require("esprima");
var es = require("./es");
var ast = require("./ast");

// TODO: Statically analyze use of undeclared variables.
// TODO: Freeze functions also.

function transformAst(node) {
    if (!isObject(node)) {
        throw new Error("Not a node: " + jsonify(node));
    }
    if (handlers.hasOwnProperty(node.type)) {
        return handlers[node.type](node);
    }
    throw new Error("Unknown AST node: " + jsonify(node));
}

function jsonify(x) {
    return JSON.stringify(x);
}

function literal(node) {
    return es.Literal(node.data);
}

var PREDEF = require("./predef-ast");

function moduleExportsEq(x) {
    return es.ExpressionStatement(
        es.AssignmentExpression('=',
            es.MemberExpression(false,
                es.Identifier('module'),
                es.Identifier('exports')
            ),
            x
        )
    );
}

function cleanIdentifier(s) {
    if (/^if|else|while|do$/.test(s)) {
        return '$' + s;
    }
    return s
        .replace(/\+/g, '$plus')
        .replace(/-/g, '$minus')
        .replace(/\*/g, '$star')
        .replace(/\//g, '$slash')
        .replace(/!/g, '$bang')
        .replace(/;/g, '$semicolon')
        .replace(/@/g, '$at')
        .replace(/\?/g, '$question')
        .replace(/\~/g, '$tilde')
        .replace(/\&/g, '$ampersand')
        .replace(/\|/g, '$pipe')
        .replace(/</g, '$lt')
        .replace(/>/g, '$gt')
        .replace(/=/g, '$eq');
}

function fileWrapper(body) {
    var useStrict = es.ExpressionStatement(es.Literal('use strict'));
    var newBody = [useStrict].concat(body);
    var fn = es.FunctionExpression(null, [], es.BlockStatement(newBody));
    return es.Program([es.CallExpression(fn, [])]);
}

var handlers = {
    Module: function(node) {
        var value = transformAst(node.expr);
        var expr = moduleExportsEq(value);
        var body = PREDEF.body.concat([expr]);
        return fileWrapper(body);
    },
    Script: function(node) {
        var value = transformAst(node.expr);
        var body = PREDEF.body.concat([value]);
        return fileWrapper(body);
    },
    GetMethod: function(node) {
        var obj = node.obj;
        var prop = ast.String(node.prop.data);
        return transformAst(
            ast.Call(
                ast.Identifier('LANG$$js_method_get'),
                [prop, obj]
            )
        );
    },
    CallMethod: function(node) {
        var obj = node.obj;
        var prop = ast.String(node.prop.data);
        var args = ast.List(node.args);
        return transformAst(
            ast.Call(
                ast.Identifier('LANG$$js_method_call'),
                [prop, obj, args]
            )
        );
    },
    GetProperty: function(node) {
        var obj = node.obj;
        var prop = ast.String(node.prop.data);
        return transformAst(
            ast.Call(
                ast.Identifier('LANG$$js_get'),
                [prop, obj]
            )
        );
    },
    BinOp: function(node) {
        var assertBoolean = function(x) {
            return transformAst(
                ast.Call(
                    ast.Identifier('LANG$$assert_boolean'),
                    [x]
                )
            );
        };
        var d = node.operator.data;
        if (d === 'and' || d === 'or') {
            var op = {and: '&&', or: '||'}[d];
            var a = assertBoolean(node.left);
            var b = assertBoolean(node.right);
            return es.LogicalExpression(op, a, b);
        }
        var f = ast.Identifier(node.operator.data);
        var args = [node.left, node.right];
        return transformAst(ast.Call(f, args));
    },
    Identifier: function(node) {
        return es.Identifier(cleanIdentifier(node.data));
    },
    IdentifierExpression: function(node) {
        return transformAst(node.data);
    },
    Call: function(node) {
        var f = transformAst(node.f);
        var args = node.args.map(transformAst);
        return es.CallExpression(f, args);
    },
    Parameter: function(node) {
        return transformAst(node.identifier);
    },
    Function: function(node) {
        var params = node
            .parameters
            .map(transformAst);
        var returnExpr = es.ReturnStatement(transformAst(node.body));
        var n = node.parameters.length;
        var arityCheck = esprima.parse(
            "if (arguments.length !== " + n + ") { " +
            "throw new LANG$$js_Error(" +
                "'expected " + n + " argument(s), " +
                "got ' + arguments.length" +
                "); " +
            "}"
        ).body;
        var preCheck = esprima.parse(
            "if (metadata.pre && !metadata.pre.apply(null, arguments)) {" +
                "throw new LANG$$js_Error(" +
                    "'Failed precondition'" +
                ");" +
            "}"
        ).body;
        var metadata = es.VariableDeclaration('var', [
            es.VariableDeclarator(
                es.Identifier('metadata'),
                transformAst(node.metadata)
            )
        ]);
        var body = flatten([
            arityCheck,
            preCheck,
            [returnExpr]
        ]);
        var innerFn = es.FunctionExpression(
            null,
            params,
            es.BlockStatement(body)
        );
        var outerFn = es.FunctionExpression(
            null,
            [],
            es.BlockStatement([
                metadata,
                es.ReturnStatement(innerFn)
            ])
        );
        return es.CallExpression(outerFn, []);
    },
    If: function(node) {
        var p = transformAst(node.p);
        var t = transformAst(node.t);
        var f = transformAst(node.f);
        return es.ConditionalExpression(p, t, f);
    },
    Binding: function(node) {
        var identifier = transformAst(node.identifier);
        var value = transformAst(node.value);
        return es.VariableDeclaration('var', [
            es.VariableDeclarator(identifier, value)
        ]);
    },
    Let: function(node) {
        var declarations = node.bindings.map(transformAst);
        var e = transformAst(node.expr);
        var returnExpr = es.ReturnStatement(e);
        var body = declarations.concat([returnExpr]);
        return es.CallExpression(
            es.FunctionExpression(
                null,
                [],
                es.BlockStatement(body)
            ),
            []
        );
    },
    List: function(node) {
        var pairs = node.data.map(transformAst);
        var array = es.ArrayExpression(pairs);
        var callee = es.Identifier('LANG$$freeze');
        return es.CallExpression(callee, [array]);
    },
    Pair: function(node) {
        return es.ArrayExpression([
            transformAst(node.key),
            transformAst(node.value)
        ]);
    },
    Map: function(node) {
        var pairs = node.data.map(transformAst);
        return es.CallExpression(
            es.Identifier('LANG$$object'),
            [es.ArrayExpression(pairs)]
        );
    },
    Number: literal,
    String: literal,
};

module.exports = transformAst;
