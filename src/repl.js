"use strict";

var readline = require("readline");
var chalk = require("chalk");

var pkg = require("../package.json");
var inspect = require("./inspect");
var compile = require("./compile");

var SHOW_JS = true;

// TODO: Run the compiled code in a completely separate node context, so that
// REPL interactions can't interact with REPL implementation details.

// This grabs a version of eval that executes in the global context, so
// predef.js doesn't just declare its variables inside `loadPredef`.
var globalEval = false || eval;

function loadPredef() {
    globalEval("var help = 'You may have meant to type :help';");
    globalEval("var quit = 'You may have meant to type :quit';");
    globalEval("var h = help;");
    globalEval("var q = quit;");
    globalEval("var exit = quit;");
}

function prettySyntaxError(code, o) {
    // TODO: Work for multiline code, if the REPL ever allows that...
    return error(
        "Syntax error at column " + o.column + "\n\n" +
        o.data + "\n\n" +
        o.context
    );
}

function runTheirCode(code) {
    code += "\n";
    var filename = "<repl.sqg>";
    var options = {
        embedSourceMaps: false,
        color: true
    };
    var res =  compile(code, filename, options);
    if (res.parsed) {
        if (SHOW_JS) {
            console.log(chalk.cyan(res.code));
        }
        console.log(inspect(globalEval(res.code)));
    } else {
        console.log(prettySyntaxError(code, res.result.oopsy));
    }
}

function processLine(rl, text) {
    if (text.trim() === "") {
        rl.prompt();
        return;
    }

    if (text.trim() === ":quit") {
        process.exit();
    }

    if (text.trim() === ":help") {
        console.log(help());
        rl.prompt();
        return;
    }

    try {
        runTheirCode(text);
    } catch (e) {
        console.log(error(e.stack));
        console.log();
        rl.prompt();
        return;
    }

    console.log();
    rl.prompt();
}

var error = chalk.bold.red;
var keyword = chalk.bold.magenta;
var header = chalk.bold.yellow;
var meta = chalk.bold.green;

function greetings() {
    return [
        "Welcome to " +
        header("Squiggle") + " " + pkg.version,
        "Type " +
        keyword(":help") +
        " for more information, or " +
        keyword(':quit') +
        " to quit.",
        ""
    ].join("\n");
}

function S(n) {
    var s = "";
    while (n -- > 0) {
        s += " ";
    }
    return s;
}

function help() {
    return [
        keyword(":help") + S(3) + "Show this help message.",
        keyword(":quit") + S(3) + "Quit Squiggle.",
        meta("expr") + S(4) + "Evaluate " + meta("expr") +
            " as an expression.",
        "",
        "This is the Squiggle interactive interpreter (REPL).",
        "If you want Squiggle compiler help, please quit and run:",
        "",
        S(4) + header("squiggle --help"),
        "",
    ].join("\n");
}

function completer(text) {
    // TODO: Keep track of bindings from ":set" to complete here...
    // For now, this just disables inserting a tab character.
    return [[], text];
}

function prompt() {
    return chalk.bold("squiggle> ");
}

function interruptMessage() {
    return chalk.red("^C");
}

function interruptHandler(rl) {
    rl.write(interruptMessage());
    rl.clearLine(process.stin, 0);
    rl.prompt();
}

function start() {
    console.log(greetings());
    loadPredef();
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        completer: completer,
    });
    rl.setPrompt(prompt());
    rl.prompt();
    rl.on("line", processLine.bind(null, rl));
    rl.on("SIGINT", interruptHandler.bind(null, rl));
}

module.exports = {
    start: start
};
