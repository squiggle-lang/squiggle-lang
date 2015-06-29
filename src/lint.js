var traverse = require("./traverse");
var OverlayMap = require("./overlay-map");

function lint(ast) {
    findUnusedBindings(ast);
}

// TODO
function findUnusedBindings(ast) {
    var scopes = OverlayMap(null);
    traverse.walk({
        enter: function(node, parent) {
            console.error('entering ' + node.type);
            if (node.type === 'Let') {
                scopes = OverlayMap(scopes);
                node.bindings.forEach(function(b, i) {
                    scopes.set(b.identifier.data, false);
                });
                console.log(node);
            } else if (node.type === 'Identifier') {
                if (parent.type !== 'Binding' && parent.type !== 'Function') {
                    scopes.set(node.data, true);
                }
            }
            console.log(scopes.toString());
        },
        exit: function(node, parent) {
            if (node.type === 'Let') {
                scopes.ownKeys().forEach(function(k) {
                    if (k.charAt(0) !== '_' && !scopes.get(k)) {
                        console.error("UNUSED VAR " + k);
                    }
                });
                scopes = scopes.parent;
            }
        }
    }, ast);
}

module.exports = lint;
