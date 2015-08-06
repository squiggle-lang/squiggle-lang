#!/usr/bin/env node
"use strict";

var UTF8 = "utf-8";

var pkg = require("../package.json");
var fs = require("fs");
var path = require("path");
var chalk = require("chalk");
var nomnom = require("nomnom")
    .script("squiggle")
    .option("input", {
        position: 0,
        metavar: "FILE",
        help: "Compile this Squiggle file",
        type: "string"
    })
    .option("output", {
        abbr: "o",
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

var parse = require("./file-parse");
var transformAst = require("./transform-ast");
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
    var txt = fs.readFileSync(src, "utf-8");
    var ast;
    try {
        ast = parse(txt);
    } catch (e) {
        if (e.name !== "SyntaxError") {
            throw e;
        }
        var expectations = e
            .expected
            .map(function(x) { return x.description; })
            .join(", ");
        die(
            e.line + ":" + e.column +
            " expected one of " + expectations +
            ", but found '" + e.found + "'."
        );
    }
    var warnings = lint(ast);
    warnings.forEach(function(m) {
        error('squiggle: lint: ' + m);
    });
    var es = transformAst(ast);
    var code = compile(es);
    fs.writeFileSync(dest, code, UTF8);
}

if (argv.interactive) {
    repl.start();
} else if (argv._.length === 1 && argv.output) {
    compileTo(argv._[0], argv.output);
} else {
    console.log(nomnom.getUsage());
    process.exit(1);
}
