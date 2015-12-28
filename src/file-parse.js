"use strict";

var parser = require("./parser");

function fileParse(text) {
    return parser.Module.parse(text);
}

module.exports = fileParse;
