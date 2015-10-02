var PREDEF = require("../predef-ast");
var fileWrapper = require("../file-wrapper");

function Script(transform, node) {
    var value = transform(node.expr);
    var body = PREDEF.body.concat([value]);
    return fileWrapper(body);
}

module.exports = Script;
