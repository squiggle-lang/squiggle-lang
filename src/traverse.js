// Root:        ["expr"],
// GetProperty: ["obj", "prop"],
// GetMethod:   ["obj", "prop"],
// CallMethod:  ["obj", "prop", "args"],
// Identifier:  ["data"],
// Call:        ["f", "args"],
// Function:    ["parameters", "body"],
// If:          ["p", "t", "f"],
// Let:         ["bindings", "expr"],
// List:        ["data"],
// Map:         ["data"],
// Number:      ["data"],
// String:      ["data"],

function walk(obj, ast) {
    var enter = obj.enter || function() {};
    var exit = obj.exit || function() {};
    var recur = walk.bind(null, obj);
    var handlers = {
        Root: function(node) {
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
        Identifier: function(node) {},
        Number: function(node) {},
        String: function(node) {},
    };
    var shouldSkip = enter(ast) === SKIP;
    if (!(ast.type in handlers)) {
        throw new Error('unknown AST node type ' + ast.type);
    }
    if (!shouldSkip) {
        handlers[ast.type](ast);
    }
    exit(ast);
}

var SKIP = "SKIP";

module.exports = {
    walk: walk,
    SKIP: SKIP
};
