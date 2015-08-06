var util = require("util");

var opts = {
    colors: true,
    depth: null,
};

// TODO: Print out values that look like Squiggle source code.
function prettyPrint(x) {
    return util.inspect(x, opts);
}

module.exports = prettyPrint;
