var die = require("../die");
var es = require("../es");

function IdentifierExpression(transform, node) {
    var id = transform(node.data);
    var name = es.Literal(node.data.data);
    var ref = es.Identifier("$ref");
    if (ref === "_") {
        die("squiggle: variable '_' cannot be referenced " +
            "as it will never be bound");
    }
    return es.CallExpression(ref, [id, name]);
}

module.exports = IdentifierExpression;
