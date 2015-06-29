var nm = require('./node-maker');

var ast = nm({
    Root:        ["expr"],
    GetProperty: ["obj", "prop"],
    GetMethod:   ["obj", "prop"],
    CallMethod:  ["obj", "prop", "args"],
    Identifier:  ["data"],
    IdentifierExpression: ["data"],
    Call:        ["f", "args"],
    Function:    ["parameters", "body"],
    Parameter:   ["identifier"],
    If:          ["p", "t", "f"],
    Let:         ["bindings", "expr"],
    List:        ["data"],
    Map:         ["data"],
    Number:      ["data"],
    String:      ["data"],
    Binding:     ["identifier", "value"],
    Pair:        ["key", "value"],
});

module.exports = ast;
