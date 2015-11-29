var estraverse = require("estraverse");

var es = require("./es");

function isSafe(id) {
    return /[a-zA-Z_][a-zA-Z0-9_]*/.test(id);
}

function enter(node) {
    var ok =
        node.type === "MemberExpression" &&
        node.computed &&
        node.property.type === "Literal" &&
        typeof node.property.value === "string" &&
        isSafe(node.property.value);
    if (ok) {
        var id = es.Identifier(null, node.property.value);
        return es.MemberExpression(null, false, node.object, id);
    }
}

function optimize(node) {
    // TODO: Allow for more optimizer functions to be run on the tree
    return estraverse.replace(node, {enter: enter});
}

module.exports = optimize;
