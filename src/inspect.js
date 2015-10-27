var util = require("util");
var tty = require("tty");

var opts = {
    depth: null,
    colors: tty.isatty(process.stdin)
    // colors: true
};

function inspect(x) {
    return util.inspect(x, opts);
}

module.exports = inspect;
