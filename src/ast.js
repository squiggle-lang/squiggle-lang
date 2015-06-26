var nm = require('./node-maker');

var ast = nm({
    Root:        ["expr"],
    GetProperty: ["obj", "prop"],
    Identifier:  ["data"],
    Call:        ["f", "args"],
    Function:    ["parameters", "body"],
    If:          ["p", "t", "f"],
    Let:         ["bindings", "expr"],
    List:        ["data"],
    Map:         ["data"],
    Number:      ["data"],
    String:      ["data"],
});

module.exports = ast;
