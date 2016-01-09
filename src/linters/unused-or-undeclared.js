var flatten = require("lodash/array/flatten");

var identsForBlock = require("../idents-for-block");
var traverse = require("../traverse");
var Scope = require("../scope");

// Only look at identifiers that are being used for their
// values, not their names.
//
// Example:
// let x = 1
// def f(z) do
//     2
// end
// y + 3
//
// `x` and `z` are being used for their names, and `y` is being
// used for its value.
function isIdentifierUsage(node, parent) {
    return (
        node.type === 'Identifier' &&
        parent.type === 'IdentifierExpression'
    );
}

function fakeTransform(x) {
    return x;
}

function markAsUsed(messages, scope, node) {
    var name = node.data;
    var start = node.loc.start;
    if (scope.hasVar(name)) {
        scope.markAsUsed(name);
    } else {
        messages.push({
            line: start.line,
            column: start.column,
            data: "undeclared variable " + name
        });
    }
}

function unusedOrUndeclared(ast) {
    var messages = [];
    var currentScope = Scope(null);
    function enter(node, parent) {
        var t = node.type;
        var start;
        if (t === 'Block') {
            currentScope = Scope(currentScope);
            start = null;
            identsForBlock(fakeTransform, node).forEach(function(ident) {
                currentScope.declare(ident.data, {
                    line: ident.loc.start.line,
                    column: ident.loc.start.column,
                    used: false
                });
            });
        } else if (t === 'Module') {
            start = null;
            identsForBlock(fakeTransform, node).forEach(function(ident) {
                currentScope.declare(ident.data, {
                    line: ident.loc.start.line,
                    column: ident.loc.start.column,
                    used: false
                });
            });
            node.exports.forEach(function(ident) {
                markAsUsed(messages, currentScope, ident);
            });
        } else if (t === 'AwaitExpr') {
            currentScope = Scope(currentScope);
            start = parent.binding.loc.start;
            currentScope.declare(parent.binding.data, {
                line: start.line,
                column: start.column,
                used: false
            });
        } else if (t === 'Function') {
            currentScope = Scope(currentScope);
            flatten([
                node.parameters.context || [],
                node.parameters.positional,
                node.parameters.slurpy || []
            ]).forEach(function(b) {
                start = b.identifier.loc.start;
                currentScope.declare(b.identifier.data, {
                    line: start.line,
                    column: start.column,
                    used: false
                });
            });
        } else if (t === 'MatchClause') {
            currentScope = Scope(currentScope);
        } else if (t === 'PatternSimple') {
            start = node.identifier.loc.start;
            currentScope.declare(node.identifier.data, {
                line: start.line,
                column: start.column,
                used: false
            });
        } else if (isIdentifierUsage(node, parent)) {
            markAsUsed(messages, currentScope, node);
        }
    }
    function exit(node, parent) {
        var t = node.type;
        var ok = (
            t === 'Block' ||
            t === 'Module' ||
            t === 'Function' ||
            t === 'MatchClause' ||
            t === 'AwaitExpr'
        );
        if (ok) {
            // Pop the scope stack and investigate for unused variables.
            currentScope.ownUnusedVars().forEach(function(id) {
                messages.push({
                    line: id.line,
                    column: id.column,
                    data: "unused variable " + id.name
                });
            });
            currentScope = currentScope.parent;
        }
    }
    traverse.walk({enter: enter, exit: exit}, ast);
    return messages;
}

module.exports = unusedOrUndeclared;
