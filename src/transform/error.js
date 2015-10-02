var throwHelper = require("../throw-helper");
var es = require("../es");

function Error(transform, node) {
    var message = transform(node.message);
    var error = es.Identifier("$Error");
    var exception = es.NewExpression(error, [message]);
    return throwHelper(exception);
}

module.exports = Error;
