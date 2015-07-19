var escodegen = require("escodegen");
var esmangle = require("esmangle");
var flow = require("lodash/function/flow");
var identity = require("lodash/utility/identity");

var SHOULD_OPTIMIZE = false;

function ensureNewline(x) {
    if (x.charAt(x.length - 1) === "\n") {
        return x;
    }
    return x + "\n";
}

var compile = flow(
    SHOULD_OPTIMIZE ? esmangle.optimize : identity,
    escodegen.generate,
    ensureNewline
);

module.exports = compile;
