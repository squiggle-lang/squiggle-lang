var flatten = require("lodash/array/flatten");

var die = require("../die");
var es = require("../es");

function Let(transform, node) {
    var undef = es.Identifier("$undef");

    // Ensure there are no duplicate identifier names.
    var names = node.bindings.map(function(b) {
        return b.identifier.data;
    });
    var namesFound = Object.create(null);
    names.forEach(function(name) {
        if (name in namesFound) {
            die("squiggle: cannot rebind " + name);
        } else {
            namesFound[name] = true;
        }
    });

    // Initialize all variables to $undef so we can perform temporal
    // deadzone checking.
    var declarations = node.bindings
        .filter(function(b) {
            return b.identifier.data !== "_";
        })
        .map(function(b) {
            var id = transform(b.identifier);
            return es.VariableDeclaration('var', [
                es.VariableDeclarator(id, undef)
            ]);
        });

    // Rebind variables to their correct values.
    var initializations = node.bindings.map(function(b) {
        var value = transform(b.value);
        if (b.identifier.data === "_") {
            return es.ExpressionStatement(value);
        } else {
            var id = transform(b.identifier);
            var assign = es.AssignmentExpression('=', id, value);
            return es.ExpressionStatement(assign);
        }
    });

    var e = transform(node.expr);
    var returnExpr = es.ReturnStatement(e);
    var body = flatten([
        declarations,
        initializations,
        returnExpr
    ]);
    var block = es.BlockStatement(body);
    var fn = es.FunctionExpression(null, [], block);
    return es.CallExpression(fn, []);
}

module.exports = Let;
