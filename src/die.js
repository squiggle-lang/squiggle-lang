"use strict";

var chalk = require("chalk");

var ERROR = chalk.bold.red;

function die() {
    var msg = [].join.call(arguments, " ");
    console.error(ERROR(msg));
    process.exit(1);
}

module.exports = die;
