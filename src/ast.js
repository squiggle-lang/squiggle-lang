var nm = require('./node-maker');

var ast = nm({
    Module:      ["expr"],
    Script:      ["expr"],
    GetProperty: ["obj", "prop"],
    GetMethod:   ["obj", "prop"],
    CallMethod:  ["obj", "prop", "args"],
    Identifier:  ["data"],
    Block:       ["expressions"],
    Call:        ["f", "args"],
    Function:    ["parameters", "body"],
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
    IdentifierExpression: ["data"],

    Match: ["expression", "clauses"],
    MatchClause: ["pattern", "expression"],
    MatchPatternSimple: ["identifier"],
    MatchPatternArray: ["patterns"],
    MatchPatternObject: ["pairs"],
    MatchPatternObjectPair: ["key", "value"],

    ReplHelp:       [],
    ReplQuit:       [],
    ReplBinding:    ["binding"],
    ReplExpression: ["expression"],
});

module.exports = ast;
