var helpersFor = require("../helpers-for");
var fileWrapper = require("../file-wrapper");

function Script(transform, node) {
    var value = transform(node.expr);
    var predef = helpersFor(value);
    var body = predef.concat([value]);
    return fileWrapper(body);
}

module.exports = Script;
