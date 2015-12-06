#!/usr/bin/env node
"use strict";

var UTF8 = "utf-8";

var pkg = require("../package.json");
var fs = require("fs");
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

function header(message) {
    var n = message.length;
    var underline = Array(n + 1).join("=")
    console.error(chalk.bold.cyan(message));
    console.error(chalk.bold.cyan(underline));
}

function die(message) {
    error("error: " + message);
    process.exit(1);
}

function compileTo(src, dest) {
    var jsOut = dest;
    // TODO: Allow disabling embedded sourcemaps.
    // TODO: Allow disabling color.
    var txt = normalizeCode(fs.readFileSync(src, "utf-8"));
    var opts = {
        embedSourceMaps: true,
        color: true
    }
    var stuff = compile(txt, src, opts);
    if (stuff.parsed) {
        header("Warnings for " + src);
        console.error();
        stuff.warnings.forEach(function(m, i, a) {
            var msg = "Line " + m.line + ": " + m.data;
            error(msg);
            console.error(m.context);
            if (i !== a.length - 1) {
                console.error();
            }
        });
        fs.writeFileSync(jsOut, stuff.code, UTF8);
    } else {
        header("Syntax error for " + src);
        console.error();
        var oopsy = stuff.result.oopsy;
        var msg = "Line " + oopsy.line + ": " + oopsy.data;
        console.error(chalk.bold.red(msg));
        console.error();
        console.error(oopsy.context);
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
