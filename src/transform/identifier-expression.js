var die = require("../die");
var es = require("../es");

function IdentifierExpression(transform, node) {
    var id = transform(node.data);
    var name = es.Literal(node.data.data);
    if (name.value === "_") {
        die("squiggle: variable '_' cannot be referenced " +
            "as it will never be bound");
    }
    var ref = es.Identifier("$ref");
    return es.CallExpression(ref, [id, name]);
}

module.exports = IdentifierExpression;
