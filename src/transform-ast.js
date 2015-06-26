var _ = require("lodash");
var fs = require("fs");
var path = require("path");
var jsbeautify = require("js-beautify");
var esprima = require("esprima");
var es = require("./es");

// TODO: Statically analyze use of undeclared variables.
// TODO: Switch to generating an AST and using escodegen to generate JS.

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
        console.log('ROOT====', node.expr);
        var value = transformAst(node.expr);
        var expr = moduleExportsEq(value);
        var body = PREDEF.body.concat([expr]);
        return es.Program(body);
    },
    GetProperty: function(node) {
        var obj = node.obj;
        var prop = {type: "String", data: node.prop.data};
        return transformAst({
            type: 'Call',
            f: {
                type: 'Identifier',
                data: 'LANG$$js_get'
            },
            args: [prop, obj]
        });
    },
    Identifier: function(node) {
        return {
            type: 'Identifier',
            name: cleanIdentifier(node.data)
        };
    },
    Call: function(node) {
        var f = transformAst(node.f);
        var args = node.args.map(transformAst);
        return es.CallExpression(f, args);
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
    Let: function(node) {
        var declarations = node.bindings.map(function(b) {
            var i = transformAst(b[0]);
            var e = transformAst(b[1]);
            return es.VariableDeclaration('var', [
                es.VariableDeclarator(i, e)
            ]);
        });
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
    Map: function(node) {
        var pairs = _.flatten(node.data).map(transformAst);
        return {
            type: 'CallExpression',
            callee: {
                type: 'Identifier',
                name: 'LANG$$object'
            },
            arguments: [{
                type: 'ArrayExpression',
                elements: pairs
            }]
        };
    },
    Number: literal,
    String: literal,
};

module.exports = transformAst;
