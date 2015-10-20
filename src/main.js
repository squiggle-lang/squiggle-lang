#!/usr/bin/env node
"use strict";

var UTF8 = "utf-8";

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
var normalizeCode = require("./normalize-code");
var compile = require("./compile");
var repl = require("./repl");

function error(message) {
    console.error(chalk.bold.red(message));
}

function die(message) {
    error("error: " + message);
    process.exit(1);
}

function compileTo(src, dest) {
    var jsOut = dest;
    // TODO: Allow configurable sourcemap output location.
    var mapOut = dest + ".map";
    var txt = normalizeCode(fs.readFileSync(src, "utf-8"));
    var stuff = compile(txt, src, jsOut, mapOut);
    if (stuff.parsed) {
        stuff.warnings.forEach(function(m) {
            var msg = [
                src,
                m.line,
                m.column + " " + m.message
            ].join(":");
            error('warning: ' + msg);
        });
        fs.writeFileSync(jsOut, stuff.code, UTF8);
        fs.writeFileSync(mapOut, stuff.sourceMap, UTF8);
    } else {
        var result = stuff.result;
        var expectations = uniq(result.expected).join(", ");
        var pos = indexToPosition(txt, result.index);
        var lines = stringToLines(txt);
        if (pos.line - 1 >= lines.length) {
            pos = {
                line: pos.line - 1,
                column: lines[pos.line - 2].length
            };
        }
        var point = chalk.reset.bold(lines[pos.line - 1]) +
            "\n" + chalk.bold.yellow(arrow(pos.column));
        die(
            src + ":" + pos.line + ":" + pos.column +
            " expected one of " + expectations + "\n\n" + point
        );
    }
}

if (argv.interactive) {
    repl.start();
} else if (argv._.length === 2) {
    compileTo(argv._[0], argv._[1]);
} else {
    console.log(nomnom.getUsage());
    process.exit(1);
}
