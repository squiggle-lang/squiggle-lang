var isObject = require("lodash/lang/isObject");

var jsonify = JSON.stringify;

var handlers = {
    Await: require("./transform/await"),
    AwaitExpr: require("./transform/await-expr"),
    Module: require("./transform/module"),
    Script: require("./transform/script"),
    GetMethod: require("./transform/get-method"),
    CallMethod: require("./transform/call-method"),
    Not: require("./transform/not"),
    Negate: require("./transform/negate"),
    ReplBinding: require("./transform/repl-expression"),
    ReplExpression: require("./transform/repl-expression"),
    GetProperty: require("./transform/get-property"),
    BinOp: require("./transform/bin-op"),
    ExprStmt: require("./transform/expr-stmt"),
    Identifier: require("./transform/identifier"),
    IdentifierExpression: require("./transform/identifier-expression"),
    Call: require("./transform/call"),
    Parameter: require("./transform/parameter"),
    Function: require("./transform/function"),
    If: require("./transform/if"),
    Try: require("./transform/try"),
    Error: require("./transform/error"),
    Throw: require("./transform/throw"),
    Require: require("./transform/require"),
    Array: require("./transform/array"),
    Object: require("./transform/object"),
    Block: require("./transform/block"),
    Match: require("./transform/match"),
    Global: require("./transform/global"),
    True: require("./transform/true"),
    False: require("./transform/false"),
    Null: require("./transform/null"),
    Undefined: require("./transform/undefined"),
    Number: require("./transform/number"),
    String: require("./transform/string")
};

function transform(node) {
    if (!isObject(node)) {
        throw new Error("Not a node: " + jsonify(node));
    }
    if (handlers.hasOwnProperty(node.type)) {
        return handlers[node.type](transform, node);
    }
    throw new Error("Unknown AST node: " + jsonify(node));
}

module.exports = transform;
