"use strict";

var readline = require("readline");
var chalk = require("chalk");

var predef = require("./predef");
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
  Object.keys(predef).forEach(function(k) {
    globalEval(predef[k].code);
  });
  global.$global = global;
  global.help = "You may have meant to type :help";
  global.quit = "You may have meant to type :quit";
  global.h = "You may have meant to type :h";
  global.q = "You may have meant to type :q";
  global.exit = global.quit;
  global.require = require;
  global.module = {exports: {}};
  global.exports = global.module.exports;
}

function prettySyntaxError(code, o) {
  // TODO: Work for multiline code, if the REPL ever allows that...
  return error("syntax error: " + o.data + "\n\n" + o.context);
}

function runTheirCode(code) {
  code += "\n";
  var filename = "<repl.sqg>";
  var options = {
    embedSourceMaps: false,
    bareModule: true,
    color: true
  };
  var res =  compile(code, filename, options);
  if (res.parsed) {
    if (SHOW_JS) {
      console.log(chalk.magenta(res.code));
    }
    console.log(inspect(globalEval(res.code)));
  } else {
    console.log(prettySyntaxError(code, res.result.oopsy));
  }
}

var currentCode = "";

function processLine(rl, text) {
  var tt = text.trim();
  if (isMultiline) {
    currentCode += text + "\n";
    rl.prompt();
  } else if (currentCode.length > 0) {
    runAllTheCode(rl, text);
  } else if (tt === "") {
    rl.prompt();
    return;
  } else if (tt === ":quit" || tt === ":q") {
    process.exit();
  } else if (tt === ":help" || tt === ":h") {
    console.log(help());
    rl.prompt();
  } else {
    runAllTheCode(rl, text);
  }
}

function runAllTheCode(rl, text) {
  try {
    var theCode = currentCode + text;
    currentCode = "";
    runTheirCode(theCode);
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
    keyword(":help") + " or " + keyword(":h") +
      S(1) + "Show this help message.",
    keyword(":quit") + " or " + keyword(":q") +
      S(1) + "Quit Squiggle.",
    keyword("Control-G") + S(3) + "Toggle multiline mode.",
    meta("expr") + S(8) + "Evaluate " + meta("expr") +
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
  var text = isMultiline ?
    "......... " :
    "squiggle> ";
  return chalk.bold(text);
}

function interruptMessage() {
  return chalk.red("^C");
}

function interruptHandler(rl) {
  rl.write(interruptMessage());
  rl.clearLine(process.stin, 0);
  rl.prompt();
}

var isMultiline = false;

function toggleMultilineMode(rl) {
  isMultiline = !isMultiline;
  rl.setPrompt(prompt());
  rl.prompt();
  if (currentCode.length > 0 || rl.line.length > 0) {
    rl.write("\n");
  }
}

function keybindHandler(rl, c, k) {
  if (k && k.ctrl && k.name === 'g') {
    toggleMultilineMode(rl);
  }
}

function start() {
  console.log(greetings());
  loadPredef();
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    completer: completer,
  });
  rl.input.on("keypress", keybindHandler.bind(null, rl));
  rl.setPrompt(prompt());
  rl.prompt();
  rl.on("line", processLine.bind(null, rl));
  rl.on("SIGINT", interruptHandler.bind(null, rl));
}

module.exports = {
  start: start
};
