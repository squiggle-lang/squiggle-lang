"use strict";

var flatten = require("lodash/array/flatten");
var esprima = require("esprima");

var ast = require("../ast");
var es = require("../es");

function declareAssign(id, expr) {
    var init = es.VariableDeclarator(id.loc, id, expr);
    return es.VariableDeclaration(null, 'var', [init]);
}

function Function_(transform, node) {
    var name = node.name ?
        transform(node.name) :
        null;
    var positional = node.parameters.positional || [];
    var params = positional
        .map(function(x, i) {
            var n = i + 1;
            var name = x.identifier.data;
            var cleanName = name === "_" ? "$" + n : name;
            return ast.Identifier(x.identifier.loc, cleanName);
        })
        .map(transform);
    var n = params.length;
    var context = node.parameters.context;
    var bindContext = context ?
        [declareAssign(transform(context), es.ThisExpression(null))] :
        [];
    var slurpy = node.parameters.slurpy;
    var getSlurpy =
        es.CallExpression(null,
            es.Identifier(null, "$slice"),
            [es.Identifier(null, "arguments"), es.Literal(null, n)]
        );
    var shouldBindSlurpy = slurpy && slurpy.identifier.data !== "_";
    var bindSlurpy = shouldBindSlurpy ?
        [declareAssign(transform(slurpy), getSlurpy)] :
        [];
    var expr = transform(node.body);
    var ret = es.ReturnStatement(expr.loc, expr);
    var argWantCount = es.Literal(null, positional.length)
    var argsLength =
        es.MemberExpression(null, false,
            es.Identifier(null, "arguments"),
            es.Identifier(null, "length")
        );
    var arityCheck = [
        es.ExpressionStatement(null,
            es.CallExpression(null,
                es.Identifier(null, "$argN"),
                [argWantCount, argsLength]
            )
        )
    ];
    if (slurpy) {
        // Argument count will never be less than zero, so remove the
        // conditional entirely.
        if (n === 0) {
            arityCheck = [];
        } else {
            arityCheck = [
                es.ExpressionStatement(null,
                    es.CallExpression(null,
                        es.Identifier(null, "$argNPlus"),
                        [argWantCount, argsLength]
                    )
                )
            ];
        }
    }
    var body = flatten([
        arityCheck,
        bindContext,
        bindSlurpy,
        ret
    ]);
    var block = es.BlockStatement(null, body);
    // React is a jerk and wants to mutate function objects a lot. Maybe one
    // day we can go back to freezing them, but until then, we'll play nice
    // with React.
    return es.FunctionExpression(node.loc, name, params, block);
}

module.exports = Function_;
