var es = require("../es");
var isJsReservedWord = require("../is-js-reserved-word");

function cleanIdentifier(s) {
    if (isJsReservedWord(s)) {
        return s + "_";
    }
    return s;
}

function Identifier(transform, node) {
    return es.Identifier(node.loc, cleanIdentifier(node.data));
}

module.exports = Identifier;
