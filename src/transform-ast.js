var _ = require("lodash");
var fs = require("fs");
var path = require("path");
var jsbeautify = require("js-beautify");
var esprima = require("esprima");
var es = require("./es");
var ast = require("./ast");

// TODO: Statically analyze use of undeclared variables.

function transformAst(node) {
    if (!_.isObject(node)) {
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

var f = path.join(__dirname, '../runtime/predef.js');
var PREDEF = esprima.parse(fs.readFileSync(f));

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
        .replace(/\?/g, '$question')
        .replace(/\~/g, '$tilde')
        .replace(/\&/g, '$and')
        .replace(/</g, '$lt')
        .replace(/>/g, '$gt')
        .replace(/=/g, '$eq');
}

var handlers = {
    Root: function(node) {
        var value = transformAst(node.expr);
        var expr = moduleExportsEq(value);
        var body = PREDEF.body.concat([expr]);
        return es.Program(body);
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
        var body = arityCheck.concat([returnExpr]);
        return es.FunctionExpression(
            null,
            params,
            es.BlockStatement(body)
        );
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
