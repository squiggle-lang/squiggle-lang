var es = require("../es");

function IdentifierExpression(transform, node) {
    var id = transform(node.data);
    var name = es.Literal(null, node.data.data);
    if (name.value === "_") {
        throw new Error("squiggle: variable '_' cannot be referenced " +
            "as it will never be bound");
    }
    var ref = es.Identifier(null, "$ref");
    return es.CallExpression(id.loc, ref, [id, name]);
}

module.exports = IdentifierExpression;
