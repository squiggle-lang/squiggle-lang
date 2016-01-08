var flatten = require("lodash/array/flatten");

var identsForBlock = require("../idents-for-block");
var traverse = require("../traverse");
var OverlayMap = require("../overlay-map");

function isIdentifierOkayToNotUse(id) {
    return id !== '_';
}

function isIdentifierUsage(node, parent) {
    return (
        node.type === 'Identifier' &&
        parent.type === 'IdentifierExpression'
    );
}

function fakeTransform(x) {
    return x;
}

function unusedOrUndeclared(ast) {
    var messages = [];
    var scopes = OverlayMap(null);
    function enter(node, parent) {
        var t = node.type;
        var start;
        if (t === 'Block' || t === 'Module') {
            scopes = OverlayMap(scopes);
            start = null;
            identsForBlock(fakeTransform, node).forEach(function(ident) {
                scopes.set(ident.data, {
                    line: ident.loc.line,
                    column: ident.loc.column,
                    used: false
                });
            });
        } else if (t === 'AwaitExpr') {
            scopes = OverlayMap(scopes);
            start = parent.binding.loc.start;
            scopes.set(parent.binding.data, {
                line: start.line,
                column: start.column,
                used: false
            });
        } else if (t === 'Function') {
            scopes = OverlayMap(scopes);
            flatten([
                node.parameters.context || [],
                node.parameters.positional,
                node.parameters.slurpy || []
            ]).forEach(function(b) {
                start = b.identifier.loc.start;
                scopes.set(b.identifier.data, {
                    line: start.line,
                    column: start.column,
                    used: false
                });
            });
        } else if (t === 'PatternSimple') {
            start = node.identifier.loc.start;
            scopes.set(node.identifier.data, {
                line: start.line,
                column: start.column,
                used: false
            });
        } else if (isIdentifierUsage(node, parent)) {
            // Only look at identifiers that are being used for their
            // values, not their names.
            //
            // Example:
            // let x = 1
            // def f(z)
            //     2
            // end
            // y + 3
            //
            // `x` and `z` are being used for their names, and `y` is being
            // used for its value.
            var k = node.data;
            if (scopes.hasKey(k)) {
                scopes.get(k).used = true;
            } else {
                messages.push({
                    line: node.loc.start.line,
                    column: node.loc.start.column,
                    data: "undeclared variable " + k
                });
            }
        }
    }
    function exit(node, parent) {
        var t = node.type;
        var ok = (
            t === 'Block' ||
            t === 'Script' ||
            t === 'Function' ||
            t === 'AwaitExpr'
        );
        if (ok) {
            // Pop the scope stack and investigate for unused variables.
            scopes.ownKeys().forEach(function(k) {
                if (isIdentifierOkayToNotUse(k) && !scopes.get(k).used) {
                    var id = scopes.get(k);
                    messages.push({
                        line: id.line,
                        column: id.column,
                        data: "unused variable " + k
                    });
                }
            });
            scopes = scopes.parent;
        }
    }
    traverse.walk({enter: enter, exit: exit}, ast);
    return messages;
}

module.exports = unusedOrUndeclared;
