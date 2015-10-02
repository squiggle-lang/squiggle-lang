var flatten = require("lodash/array/flatten");

var es = require("../es");

function pairToArray(pair) {
    return [pair.key, pair.value];
}

function Object_(transform, node) {
    var pairs = node.data.map(pairToArray);
    var args = flatten(pairs).map(transform);
    var id = es.Identifier('$object');
    return es.CallExpression(id, args);
}

module.exports = Object_;
