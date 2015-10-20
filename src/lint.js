var flatten = require("lodash/array/flatten");
var predefAst = require("./predef-ast");
var traverse = require("./traverse");
var OverlayMap = require("./overlay-map");

function lint(ast) {
    return flatten([
        findUnusedOrUndeclaredBindings(ast)
    ]);
}

function isIdentifierOkayToNotUse(id) {
    return id !== '_';
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
        var t = node.type;
        if (t === 'Let') {
            scopes = OverlayMap(scopes);
            node.bindings.forEach(function(b) {
                var start = b.identifier.loc.start;
                scopes.setBest(b.identifier.data, {
                    line: start.line,
                    column: start.column,
                    used: false
                });
            });
        } else if (t === 'Function') {
            scopes = OverlayMap(scopes);
            flatten([
                node.parameters.context || [],
                node.parameters.positional,
                node.parameters.slurpy || []
            ]).forEach(function(binding) {
                var start = b.identifier.loc.start;
                scopes.setBest(b.identifier.data, {
                    line: start.line,
                    column: start.column,
                    used: false
                });
            });
        } else if (t === 'MatchClause') {
            scopes = OverlayMap(scopes);
        } else if (t === 'MatchPatternSimple') {
            var start = node.identifier.loc.start;
            scopes.setBest(node.identifier.data, {
                line: start.line,
                column: start.column,
                used: false
            });
        } else if (isIdentifierUsage(node, parent)) {
            // Only look at identifiers that are being used for their
            // values, not their names.
            //
            // Example:
            // let x = 1 def f(z) = 2 in y
            //
            // `x` and `z` are being used for their names, and `y` is being
            // used for its value.
            var k = node.data;
            if (!implicitlyDeclared(k) && !scopes.hasKey(k)) {
                messages.push({
                    line: node.loc.start.line,
                    column: node.loc.start.column,
                    message: "undeclared variable " + k
                });
            } else {
                scopes.get(k).used = true;
            }
        }
    }
    function exit(node, parent) {
        var t = node.type;
        if (t === 'Let' || t === 'Function' || t === 'MatchClause') {
            // Pop the scope stack and investigate for unused variables.
            scopes.ownKeys().forEach(function(k) {
                if (isIdentifierOkayToNotUse(k) && !scopes.get(k).used) {
                    var id = scopes.get(k);
                    messages.push({
                        line: id.line,
                        column: id.column,
                        message: "unused variable " + k
                    });
                }
            });
            scopes = scopes.parent;
        }
    }
    traverse.walk({enter: enter, exit: exit}, ast);
    return messages;
}

module.exports = lint;
