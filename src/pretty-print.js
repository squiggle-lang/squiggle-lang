var util = require("util");

var opts = {
    colors: true,
    depth: null,
}

function prettyPrint(x) {
    return util.inspect(x, opts);
}

module.exports = prettyPrint;
