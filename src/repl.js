var pkg = require("../package.json");
var readline = require("readline");
var chalk = require("chalk");

var parse = require("./repl-parse");
var compile = require("./compile");
var transformAst = require("./transform-ast");
var prettyPrint = require("./pretty-print");

function transformAndEval(ast) {
    var es = transformAst(ast);
    var js = compile(es);
    return globalEval(js);
}

// TODO: Run the compiled code in a completely separate node context, so that
// REPL interactions can't interact with REPL implementation details.

// This grabs a version of eval that executes in the global context, so
// predef.js doesn't just declare its variables inside `loadPredef`.
var globalEval = false || eval;

function loadPredef() {
    var es = require("./predef-ast");
    var js = compile(es);
    globalEval(js);
    globalEval("var help = 'You may have meant to type :help';");
    globalEval("var quit = 'You may have meant to type :quit';");
    globalEval("var h = help;");
    globalEval("var q = quit;");
    globalEval("var exit = quit;");
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
    if (text.trim() === "") {
        rl.prompt();
        return;
    }

    try {
        var ast = parse(text);
    } catch (e) {
        if (e.name !== "SyntaxError") {
            console.log(error(e.stack));
        } else {
            console.log(prettySyntaxError(e));
        }
        console.log();
        rl.prompt();
        return;
    }

    if (ast.type === "ReplQuit") {
        process.exit();
    }

    if (ast.type === "ReplHelp") {
        console.log(help());
        rl.prompt();
        return;
    }

    try {
        console.log(prettyPrint(transformAndEval(ast)));
    } catch (e) {
        console.log(error(e.stack));
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
        keyword(":set ") + meta("x = expr") + S(2) + "Set " + meta("x") +
            " to the value of " + meta("expr") + " globally.",
        keyword(":help") + S(10) + "Show this help message.",
        keyword(":quit") + S(10) + "Quit Squiggle.",
        meta("expr") + S(11) + "Evaluate " + meta("expr") +
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
