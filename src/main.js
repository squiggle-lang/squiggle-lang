#!/usr/bin/env node
"use strict";

var UTF8 = "utf-8";

var pkg = require("../package.json");
var fs = require("fs");
var vm = require("vm");
var chalk = require("chalk");
var hook = require("node-hook");
var path = require("path");
var uniq = require("lodash/array/uniq");
var nomnom = require("nomnom")
    .script("squiggle")
    .option("input", {
        position: 0,
        metavar: "FILE",
        help: "Execute this Squiggle file",
        type: "string"
    })
    .option("output", {
        metavar: "FILE",
        abbr: "o",
        help: "Write JavaScript to this file",
        type: "string",
        flag: true
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

function compileSource(src) {
    // TODO: Allow disabling embedded sourcemaps.
    var txt = normalizeCode(fs.readFileSync(src, "utf-8"));
    var stuff = compile(txt, src, {embedSourceMaps: true});
    if (stuff.parsed) {
        stuff.warnings.forEach(function(m) {
            var msg = [
                src,
                m.line,
                m.column + " " + m.message
            ].join(":");
            error('warning: ' + msg);
        });
        return stuff.code;
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

function compileAndRun(src) {
    var js = compileSource(src);
    var script = new vm.Script(js);
    var root = global;
    root.require = function(id) {
        try {
            return require(path.resolve(id));
        } catch (Error) {
            return require(id);
        }
    };
    root.__filename = path.normalize(path.join(process.cwd(), src));
    root.__dirname = path.dirname(root.__filename) + "/";

    hook.hook(".sqg", function(src, filename) {
        return compileSource(filename);
    });

    var ctx = vm.createContext(root);
    script.runInContext(ctx);

    hook.unhook(".sqg");
}

function compileTo(src, dest) {
    var js = compileSource(src);
    fs.writeFileSync(dest, js, UTF8);
}

if (argv.interactive) {
    repl.start();
} else if (argv._.length === 1) {
    compileAndRun(argv._[0]);
} else if (argv._.length === 2) {
    compileTo(argv._[0], argv._[1]);
} else {
    console.log(nomnom.getUsage());
    process.exit(1);
}
