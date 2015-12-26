var estraverse = require("estraverse");
var matches = require("lodash/utility/matches");
var get = require("lodash/object/get");

var es = require("./es");

function isSafe(id) {
    return /[a-zA-Z_][a-zA-Z0-9_]*/.test(id);
}

// Turns `foo["bar"]` into `foo.bar`
function optimizePropertyAccess(node) {
    var ok =
        node.type === "MemberExpression" &&
        node.computed &&
        node.property.type === "Literal" &&
        typeof node.property.value === "string" &&
        isSafe(node.property.value);
    if (ok) {
        var id = es.Identifier(null, node.property.value);
        return es.MemberExpression(null, false, node.object, id);
    }
}

// Turns `return (function() { return EXPR }())` into `return EXPR`
function optimizeNestedIifes(node) {
    var ok =
        matches({
            type: "ReturnStatement",
            argument: {
                type: "CallExpression",
                callee: {
                    type: "FunctionExpression",
                    body: {}
                }
            }
        })(node) &&
        get(node, "argument.arguments.length") === 0 &&
        get(node, "argument.callee.params.length") === 0 &&
        get(node, "argument.callee.body.body.length") === 1 &&
        get(node, "argument.callee.body.body[0].type") === "ReturnStatement";
    if (ok) {
        // console.error("ITS HAPPENING", JSON.stringify(node, null, 2));
        var kidNode = node.argument.callee.body.body[0]
        estraverse.replace(kidNode, {enter: optimizeNestedIifes});
        return kidNode;
    }
}

function optimize(node) {
    estraverse.replace(node, {enter: optimizePropertyAccess});
    estraverse.replace(node, {enter: optimizeNestedIifes});
    return node;
}

module.exports = optimize;
