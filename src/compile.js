var escodegen = require("escodegen");
var esmangle = require("esmangle");

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

function generateCodeAndSourceMap(node, code) {
    return escodegen.generate(node, {
        sourceMap: true,
        sourceMapWithCode: true,
        sourceContent: code
    });
}

function addSourceMapUrl(code, url) {
    return code + "\n//# sourceMappingURL=" + url + "\n";
}

// TODO: Make it possible to compile REPL code as well.
function compile(squiggleCode, filename) {
    if (arguments.length === 1) {
        filename = "__UNNAMED_FILE__.SQUIGGLE";
    }
    // TODO: Allow specifying another name for the source map?
    var sourceMapFilename = filename + ".map";
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
    var stuff = generateCodeAndSourceMap(optimizedAst, squiggleCode);
    var code = addSourceMapUrl(ensureNewline(stuff.code), sourceMapFilename);
    var sourceMap = stuff.map.toString();
    // console.error("sqgl ast: ", squiggleAst);
    // console.error("warnings: ", warnings);
    // console.error("js:", code);
    // console.error("map: ", sourceMap);
    return {
        parsed: true,
        warnings: warnings,
        sourceMap: sourceMap,
        code: code
    };
}

module.exports = compile;
