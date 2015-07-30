var nm = require('./node-maker');

var ast = nm({
    Module:      ["expr"],
    Script:      ["expr"],
    GetProperty: ["obj", "prop"],
    GetMethod:   ["obj", "prop"],
    CallMethod:  ["obj", "prop", "args"],
    Identifier:  ["data"],
    Block:       ["expressions"],
    IdentifierExpression: ["data"],
    Call:        ["f", "args"],
    Function:    ["metadata", "parameters", "body"],
    Parameter:   ["identifier"],
    If:          ["p", "t", "f"],
    Let:         ["bindings", "expr"],
    BinOp:       ["operator", "left", "right"],
    Operator:    ["data"],
    List:        ["data"],
    Map:         ["data"],
    Number:      ["data"],
    String:      ["data"],
    True:        [],
    False:       [],
    Null:        [],
    Undefined:   [],
    Binding:     ["identifier", "value"],
    Pair:        ["key", "value"],
});

module.exports = ast;
