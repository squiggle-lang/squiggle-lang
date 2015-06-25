"use strict";

var fs = require("fs");
var parse = require("./parse");
var compile = require("./compile");
var path = require("path");
var f = path.join(__dirname, "../examples/input.txt");
var txt = fs.readFileSync(f, "utf-8");

var ast = parse(txt);

var code = compile(ast);
var json = JSON.stringify(ast, null, 2);

console.log("=== AST ===");
console.log(json);

console.log("=== CODE ===");
console.log(code);

function unsafeEval(code) {
    /*jshint evil:true*/
    return eval(code);
}

var theModule = unsafeEval(code);

console.log("=== MODULE ===");
console.log(theModule);

if (typeof theModule.main === 'function') {
    console.log("=== MAIN ===");
    console.log(theModule.main());
}
