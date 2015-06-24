"use strict";

var fs = require("fs");
var parse = require("./parse");
var compile = require("./compile");
var txt = fs.readFileSync("input.txt", "utf-8");

var ast = parse(txt);

var code = compile(ast);
var json = JSON.stringify(ast, null, 2);

console.log("=== AST ===");
console.log(json);

console.log("=== CODE ===");
console.log(code);

var module = eval(code);

console.log("=== MODULE ===");
console.log(module);

if (typeof module.main === 'function') {
    console.log("=== MAIN ===");
    console.log(module.main());
}
