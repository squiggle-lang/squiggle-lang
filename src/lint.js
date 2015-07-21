var flatten = require("lodash/array/flatten");
var includes = require("lodash/collection/includes");
var predefAst = require("./predef-ast");
var traverse = require("./traverse");
var OverlayMap = require("./overlay-map");

function lint(ast) {
    return flatten([
        findUnusedOrUndeclaredBindings(ast)
    ]);
}

function isIdentifierOkayToNotUse(id) {
    return id.charAt(0) !== '_';
}

function isNewScope(node, parent) {
    return (
        node.type === 'Let' ||
        node.type === 'Function'
    );
}

function isIdentifierUsage(node, parent) {
    return (
        node.type === 'Identifier' &&
        parent.type === 'IdentifierExpression'
    );
}

function isIdentifierDeclaration(node) {
    return node.type === 'VariableDeclaration';
}

function getDeclarationName(node) {
    return node.declarations[0].id.name;
}

function isValidIdentifier(id) {
    return (
        id.indexOf('$') !== 0 &&
        id.indexOf('sqgl$$') !== 0
    );
}

var predefIdentifiers = predefAst
    .body
    .filter(isIdentifierDeclaration)
    .map(getDeclarationName)
    .filter(isValidIdentifier);

var nodeIdentifiers = [
    'require'
];

var browserIdentifiers = [
    'console'
];

var browserifyIdentifiers = flatten([
    nodeIdentifiers,
    browserIdentifiers,
]);

var implicitlyDeclaredIdentifiers = flatten([
    browserifyIdentifiers,
    predefIdentifiers,
]);

// TODO: Add standard library for Squiggle and Node and browsers.
function implicitlyDeclared(k) {
    return implicitlyDeclaredIdentifiers.indexOf(k) >= 0;
}

function findUnusedOrUndeclaredBindings(ast) {
    var messages = [];
    var scopes = OverlayMap(null);
    function enter(node, parent) {
        if (isNewScope(node, parent)) {
            // Let and Function are the only ways to create variable
            // bindings currently. Make a new scope when we enter them,
            // registering all declared identifiers.
            var identifiers = node.bindings || node.parameters;
            scopes = OverlayMap(scopes);
            identifiers.forEach(function(b) {
                scopes.setBest(b.identifier.data, false);
            });
        } else if (isIdentifierUsage(node, parent)) {
            // Only look at identifiers that are being used for their
            // values, not their names.
            //
            // Example:
            // let (x = 1, f = ~(z) 2) in y
            //
            // `x` and `z` are being used for their names, and `y` is being
            // used for its value.
            var k = node.data;
            if (!implicitlyDeclared(k) && !scopes.hasKey(k)) {
                messages.push("undeclared variable " + k);
            }
            scopes.setBest(k, true);
        }
    }
    function exit(node, parent) {
        if (isNewScope(node, parent)) {
            // Pop the scope stack and investigate for unused variables.
            scopes.ownKeys().forEach(function(k) {
                if (isIdentifierOkayToNotUse(k) && !scopes.get(k)) {
                    messages.push("unused variable " + k);
                }
            });
            scopes = scopes.parent;
        }
    }
    traverse.walk({enter: enter, exit: exit}, ast);
    return messages;
}

module.exports = lint;
