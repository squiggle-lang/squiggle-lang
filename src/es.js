var nm = require('./node-maker');

var es = nm({
    Program: ['body'],
    Literal: ['value'],
    Identifier: ['name'],
    LogicalExpression: ['operator', 'left', 'right'],
    ExpressionStatement: ['expression'],
    AssignmentExpression: ['operator', 'left', 'right'],
    MemberExpression: ['computed', 'object', 'property'],
    CallExpression: ['callee', 'arguments'],
    ConditionalExpression: ['test', 'consequent', 'alternate'],
    ArrayExpression: ['elements'],
    ReturnStatement: ['argument'],
    BlockStatement: ['body'],
    FunctionExpression: ['id', 'params', 'body'],
    VariableDeclaration: ['kind', 'declarations'],
    VariableDeclarator: ['id', 'init'],
});

module.exports = es;
