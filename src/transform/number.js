var es = require("../es");

function Number_(transform, node) {
    return es.Literal(node.data);
}

module.exports = Number_;
