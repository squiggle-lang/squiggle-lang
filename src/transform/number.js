var es = require("../es");

function Number_(transform, node) {
    // Check for NaN
    if (node.data !== node.data) {
        return es.Identifier("NaN");
    }
    if (node.data === Infinity) {
        return es.Identifier("Infinity");
    }
    return es.Literal(node.data);
}

module.exports = Number_;
