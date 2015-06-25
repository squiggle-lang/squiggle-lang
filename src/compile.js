var _ = require("lodash");
var fs = require("fs");
var path = require("path");
var jsbeautify = require("js-beautify");

// TODO: Statically analyze use of undeclared variables.
// TODO: Switch to generating an AST and using escodegen to generate JS.

function compile(node) {
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

var simple = _.flow(_.property("data"), jsonify);

var f = path.join(__dirname, '../runtime/predef.js');
var PREDEF = fs.readFileSync(f);

var postProcessSource = jsbeautify;
// var postProcessSource = _.identity;

var handlers = {
    Root: function(node) {
        return postProcessSource(
            "(function() {\n" +
            "'use strict';\n" +
            "/// STANDARD LIBRARY\n" +
            PREDEF + "\n" +
            "/// MAIN CODE\n" +
            "return " + compile(node.expr) + ";\n" +
            "}());"
        );
    },
    GetProperty: function(node) {
        var obj = compile(node.obj);
        var prop = compile({type: "String", data: node.prop.data});
        return "LANG$$js_get(" + prop + ", " + obj + ")";
    },
    Identifier: function(node) {
        var s = node.data;
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
    },
    Call: function(node) {
        var f = compile(node.f);
        var args = node.args.map(compile).join(", ");
        return f + "(" + args + ")";
    },
    Function: function(node) {
        var params = node
            .parameters
            .map(compile)
            .join(", ");
        var body = compile(node.body);
        var n = node.parameters.length;
        return (
            "(function(" + params + ") {\n" +
            "if (arguments.length !== " + n + ") {\n" +
            "throw new LANG$$js_Error('expected " + n + " argument(s), got " +
            "' + arguments.length);\n" +
            "}\n" +
            "return " + body + ";\n" +
            "})\n"
        );
    },
    If: function(node) {
        var p = compile(node.p);
        var t = compile(node.t);
        var f = compile(node.f);
        return "(" + p + " ? " + t + " : " + f + ")";
    },
    Let: function(node) {
        var bindings = node.bindings.map(function(b) {
            var i = compile(b[0]);
            var e = compile(b[1]);
            return "var " + i + " = " + e + ";\n";
        }).join('');
        var e = compile(node.expr);
        return (
            "(function() {" +
            bindings +
            "return " + e + ";\n" +
            "}())"
        );
    },
    List: function(node) {
        var pairs = node.data.map(compile).join(", ");
        return "LANG$$freeze([" + pairs + "])";
    },
    Map: function(node) {
        var pairs = _.flatten(node.data).map(compile).join(', ');
        return "LANG$$object([" + pairs + "])";
    },
    Number: simple,
    String: simple,
};

module.exports = compile;
