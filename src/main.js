#!/usr/bin/env node
"use strict";

var UTF8 = "utf-8";

var WRITE_TO_STDOUT = {_: "WRITE_TO_STDOUT"};

var pkg = require("../package.json");
var fs = require("fs");
var chalk = require("chalk");
var uniq = require("lodash/array/uniq");
var nomnom = require("nomnom")
    .script("squiggle")
    .option("input", {
        position: 0,
        metavar: "FILE",
        help: "Compile this Squiggle file",
        type: "string"
    })
    .option("output", {
        position: 1,
        metavar: "FILE",
        help: "Write JavaScript to this file",
        type: "string"
    })
    .option("interactive", {
        abbr: "i",
        help: "Enter interactive shell",
        flag: true
    })
    .option("help", {
        abbr: "h",
        help: "Print this message",
        flag: true
    })
    .option("version", {
        abbr: "v",
        help: "Print verision number",
        flag: true,
        callback: function() { return pkg.version; }
    });
var argv = nomnom.parse();

var arrow = require("./arrow");
var stringToLines = require("./string-to-lines");
var indexToPosition = require("./index-to-position");
var parse = require("./file-parse");
var transformAst = require("./transform-ast");
var normalizeCode = require("./normalize-code");
var compile = require("./compile");
var lint = require("./lint");
var repl = require("./repl");

function error(message) {
    console.error(chalk.bold.red(message));
}

function die(message) {
    error("squiggle: error: " + message);
    process.exit(1);
}

function compileTo(src, dest) {
    var txt = normalizeCode(fs.readFileSync(src, "utf-8"));
    var ast;
    var result = parse(txt);
    if (result.status) {
        ast = result.value;
    } else {
        var expectations = uniq(result.expected).join(", ");
        var pos = indexToPosition(txt, result.index);
        var lines = stringToLines(txt);
        var point = chalk.reset.bold(lines[pos.line - 1]) +
            "\n" + chalk.bold.yellow(arrow(pos.column));
        die(
            src + " " + pos.line + ":" + pos.column +
            " expected one of " + expectations + "\n\n" + point
        );
    }
    var warnings = lint(ast);
    warnings.forEach(function(m) {
        error('squiggle: lint: ' + m);
    });
    var es = transformAst(ast);
    var code = compile(es);
    if (dest === WRITE_TO_STDOUT) {
        console.log(code);
    } else {
        fs.writeFileSync(dest, code, UTF8);
    }
}

if (argv.interactive) {
    repl.start();
} else if (argv._.length === 1) {
    compileTo(argv._[0], WRITE_TO_STDOUT);
} else if (argv._.length === 2) {
    compileTo(argv._[0], argv._[1]);
} else {
    console.log(nomnom.getUsage());
    process.exit(1);
}
