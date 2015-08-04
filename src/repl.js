var pkg = require("../package.json");
var readline = require("readline");
var chalk = require("chalk");

function processLine(rl, text) {
    if (text === ":quit") {
        process.exit();
    }
    if (text.trim() === "") {
        rl.prompt();
        return;
    }
    try {
        console.log(eval(text));
    } catch (e) {
        console.log(error(e.stack));
    }
    console.log();
    rl.prompt();
}

var error = chalk.bold.red;
var keyword = chalk.bold.magenta;
var header = chalk.bold.yellow;

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
