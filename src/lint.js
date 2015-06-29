var flatten = require("lodash/array/flatten");
var traverse = require("./traverse");
var OverlayMap = require("./overlay-map");

function lint(ast) {
    return flatten([
        findUnusedBindings(ast)
    ]);
}

function isIdentifierOkayToNotUse(id) {
    return id.charAt(0) !== '_';
}

function findUnusedBindings(ast) {
    var messages = [];
    var scopes = OverlayMap(null);
    traverse.walk({
        enter: function(node, parent) {
            if (node.type === 'Let') {
                scopes = OverlayMap(scopes);
                node.bindings.forEach(function(b, i) {
                    scopes.set(b.identifier.data, false);
                });
            } else if (node.type === 'Identifier') {
                if (parent.type !== 'Binding' && parent.type !== 'Function') {
                    scopes.set(node.data, true);
                }
            }
        },
        exit: function(node, parent) {
            if (node.type === 'Let') {
                scopes.ownKeys().forEach(function(k) {
                    if (isIdentifierOkayToNotUse(k) && !scopes.get(k)) {
                        messages.push("unused variable " + k);
                    }
                });
                scopes = scopes.parent;
            }
        }
    }, ast);
    return messages;
}

module.exports = lint;
