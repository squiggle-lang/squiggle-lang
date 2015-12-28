"use strict";

var mapValues = require("lodash/object/mapValues");

var nm = require('./node-maker');

var almostAst = {
    Module:      ["statements", "exports"],
    Try:         ["expr"],
    Require:     ["expr"],
    Not:         ["expr"],
    Negate:      ["expr"],
    Block:       ["statements", "expression"],
    ExprStmt:    ["expression"],
    GetProperty: ["obj", "prop"],
    GetMethod:   ["obj", "prop"],
    CallMethod:  ["obj", "prop", "args"],
    Await:       ["binding", "promise", "expression"],
    AwaitExpr:   ["expression"],
    Identifier:  ["data"],
    Call:        ["f", "args"],
    Function:    ["name", "parameters", "body"],
    Parameter:   ["identifier"],
    Parameters:  ["context", "positional", "slurpy"],
    If:          ["condition", "ifBranch", "elseIfs", "elseBranch"],
    ElseIf:      ["condition", "branch"],
    Let:         ["binding"],
    BinOp:       ["operator", "left", "right"],
    Error:       ["message"],
    Throw:       ["exception"],
    Operator:    ["data"],
    Array:       ["data"],
    Object:      ["data"],
    Number:      ["data"],
    String:      ["data"],
    True:        [],
    Global:      [],
    False:       [],
    Null:        [],
    Undefined:   [],
    Binding:     ["pattern", "value"],
    Pair:        ["key", "value"],
    IdentifierExpression: ["data"],

    Match: ["expression", "clauses"],
    MatchClause: ["pattern", "expression"],
    PatternSimple: ["identifier"],
    PatternParenExpr: ["expr"],
    PatternLiteral: ["data"],
    PatternArray: ["patterns"],
    PatternArraySlurpy: ["patterns", "slurp"],
    PatternObject: ["pairs"],
    PatternObjectPair: ["key", "value"],
};

function addLoc(array, k) {
    return ["index"].concat(array);
}

var ast = nm("ast", mapValues(almostAst, addLoc));

module.exports = ast;
