#!/usr/bin/env node
"use strict";

var UTF8 = "utf-8";
var USAGE = [
    "Usage: squiggle [file] -o [file]",
    "",
    "Examples: squiggle main.squiggle -o main.js"
].join("\n");

function K(x) { return function() { return x; }; }

var pkg = require("../package.json");
var fs = require("fs");
var path = require("path");
var chalk = require("chalk");
var argv = require("nomnom")
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
    .option("help", {
        abbr: "h",
        help: "Print this message",
        flag: true,
        callback: K(USAGE)
    })
    .option("version", {
        abbr: "v",
        help: "Print verision number",
        flag: true,
        callback: K(pkg.version)
    })
    .parse();

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
    try {
        var ast = parse(txt);
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

if (argv._.length === 0) {
    repl.start();
} else {
    compileTo(argv._[0], argv.output);
}
