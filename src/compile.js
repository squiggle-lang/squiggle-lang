var escodegen = require("escodegen");
var esmangle = require("esmangle");

var addLocMaker = require("./file-index-to-position-mapper");
var transformAst = require("./transform-ast");
var traverse = require("./traverse");
var inspect = require("./inspect");
var parse = require("./file-parse");
var lint = require("./lint");

var SHOULD_OPTIMIZE = false;

function ensureNewline(x) {
    if (x.charAt(x.length - 1) === "\n") {
        return x;
    }
    return x + "\n";
}

function generateCodeAndSourceMap(node, name, code) {
    return escodegen.generate(node, {
        sourceMap: name,
        sourceMapWithCode: true,
        sourceContent: code
    });
}

function addSourceMapUrl(code, url) {
    return code + "\n//# sourceMappingURL=" + url + "\n";
}

// TODO: Make it possible to compile REPL code as well.
function compile(squiggleCode, sqglFilename, jsFilename, sourceMapFilename) {
    if (arguments.length !== compile.length) {
        throw new Error("incorrect argument count to compile");
    }
    var result = parse(squiggleCode);
    if (!result.status) {
        return {parsed: false, result: result};
    }
    var squiggleAst = result.value;
    var addLocToNode = addLocMaker(squiggleCode, sqglFilename);
    traverse.walk({enter: addLocToNode}, squiggleAst);
    // console.log(inspect(squiggleAst));
    var warnings = lint(squiggleAst);
    var esAst = transformAst(squiggleAst);
    var optimizedAst = SHOULD_OPTIMIZE ?
        esmangle.optimize(esAst) :
        esAst;
    var stuff = generateCodeAndSourceMap(optimizedAst, sqglFilename, squiggleCode);
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
