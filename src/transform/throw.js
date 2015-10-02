var throwHelper = require("../throw-helper");

function Throw(transform, node) {
    var exception = transform(node.exception);
    return throwHelper(exception);
}

module.exports = Throw;
