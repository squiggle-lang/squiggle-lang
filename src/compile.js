var escodegen = require("escodegen");
var esmangle = require("esmangle");
var flow = require("lodash/function/flow");
var identity = require("lodash/utility/identity");

var SHOULD_OPTIMIZE = false;

var compile = flow(
    SHOULD_OPTIMIZE ? esmangle.optimize : identity,
    escodegen.generate
);

module.exports = compile;
