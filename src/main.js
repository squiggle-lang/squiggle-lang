#!/usr/bin/env node
"use strict";

var usage = [
    "Usage: squiggle [file] -o [file]",
    "",
    "Examples: squiggle main.squiggle -o main.js"
].join("\n");

var pkg = require("../package.json");
var fs = require("fs");
var path = require("path");
var argv = require("yargs")
    .demand(1)
    .usage(usage)
    .option("o", {
        alias: "output",
        describe: "Write JavaScript to this file or directory",
        nargs: 1,
        string: true,
        demand: true
    })
    .option("h", {
        alias: "help",
        describe: "Print this message"
    })
    .alias("v", "version")
    .version(pkg.version)
    .epilogue("Version " + pkg.version)
    .showHelpOnFail(true)
    .strict()
    .argv;

var parse = require("./parse");
var transformAst = require("./transform-ast");
var compile = require("./compile");
var lint = require("./lint");

var UTF8 = "utf-8";

function die(message) {
    console.error("squiggle: error: " + message);
    process.exit(1);
}

function compileTo(src, dest) {
    var txt = fs.readFileSync(src, "utf-8");
    var ast = parse(txt);
    var warnings = lint(ast);
    warnings.forEach(function(m) {
        console.error('squiggle: lint: ' + m);
    });
    var es = transformAst(ast);
    var code = compile(es);
    fs.writeFileSync(dest, code, UTF8);
}

compileTo(argv._[0], argv.output);
