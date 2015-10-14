var escodegen = require("escodegen");
var esmangle = require("esmangle");
var flow = require("lodash/function/flow");
var identity = require("lodash/utility/identity");

var addLocMaker = require("./file-index-to-position-mapper");
var transformAst = require("./transform-ast");
var traverse = require("./traverse");
var parse = require("./file-parse");
var lint = require("./lint");

var SHOULD_OPTIMIZE = false;

function ensureNewline(x) {
    if (x.charAt(x.length - 1) === "\n") {
        return x;
    }
    return x + "\n";
}

function generateCodeAndSourceMap(node) {
    return escodegen.generate(node, {
        sourceMap: true,
        sourceMapWithCode: true,
        sourceContent: code
    })
}

// TODO: Make it possible to compile REPL code as well.
function compile(squiggleCode, filename) {
    if (arguments.length === 1) {
        filename = "__UNNAMED_FILE__.SQUIGGLE"
    }
    var result = parse(squiggleCode);
    if (!result.status) {
        return {parsed: false, result: result};
    }
    var squiggleAst = result.value;
    var addLocToNode = addLocMaker(squiggleCode, filename);
    traverse.walk({enter: addLocToNode}, squiggleAst);
    var warnings = lint(squiggleAst);
    var esAst = transformAst(squiggleAst);
    var optimizedAst = SHOULD_OPTIMIZE ?
        esmangle.optimize(esAst) :
        esAst;
    var stuff = escodegen.generate(optimizedAst, {
        sourceMap: filename,
        sourceMapWithCode: true,
        sourceContent: squiggleCode
    });
    var code = ensureNewline(stuff.code);
    var sourceMap = stuff.map;
    console.error("sqgl ast: ", squiggleAst);
    // console.error("warnings: ", warnings);
    // console.error("js:", code);
    console.error("map: ", sourceMap);
    return {
        parsed: true,
        warnings: warnings,
        sourceMap: sourceMap,
        code: code
    }
}

module.exports = compile;
