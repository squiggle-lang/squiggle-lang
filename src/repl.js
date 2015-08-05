var pkg = require("../package.json");
var readline = require("readline");
var chalk = require("chalk");

var parse = require("./repl-parse");
var compile = require("./compile");
var transformAst = require("./transform-ast");
var prettyPrint = require("./pretty-print");

function squiggleEval(text) {
    var ast = parse(text);
    var es = transformAst(ast);
    var js = compile(es);
    return eval(js);
}

// This grabs a version of eval that executes in the global context, so
// predef.js doesn't just declare its variables inside `loadPredef`.
var globalEval = false || eval;

function loadPredef() {
    var es = require("./predef-ast");
    var js = compile(es);
    globalEval(js);
}

function prettySyntaxError(e) {
    var expectations = e
        .expected
        .map(function(e) { return e.description; })
        .join(", ");
    return error(
        "syntax error:" +
        " expected one of " + expectations +
        " but got '" + e.found + "'"
    );
}

function processLine(rl, text) {
    if (text.trim() === ":quit") {
        process.exit();
    } else if (text.trim() === ":help") {
        console.log(help());
    } else if (text.trim() === "") {
        rl.prompt();
    } else {
        try {
            console.log(prettyPrint(squiggleEval(text)));
        } catch (e) {
            if (e.name !== "SyntaxError") {
                console.log(error(e.stack));
            } else {
                console.log(prettySyntaxError(e));
            }
        }
        console.log();
    }
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
        keyword(":set ") + meta("x = y") + S(2) + "Set " + meta("x") +
            " to the value of the " + meta("y") + " globally.",
        keyword(":help") + S(7) + "Show this help message.",
        keyword(":quit") + S(7) + "Quit Squiggle.",
        meta("expr") + S(8) + "Evaluate " + meta("expr") +
            " as a Squiggle expression.",
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
    return chalk.red(" ^C");
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
