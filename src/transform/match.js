var esprima = require("esprima");

var es = require("../es");
var ph = require("./pattern-helpers");

function Match(transform, node) {
    var e = transform(node.expression);
    var body = node.clauses.map(matchClause.bind(null, transform));
    var matchError =
        esprima.parse("throw new Error('pattern match failure');").body;
    var block = es.BlockStatement(null, body.concat(matchError));
    var id = es.Identifier(null, "$match");
    var fn = es.FunctionExpression(null, null, [id], block);
    return es.CallExpression(node.loc, fn, [e]);
}

function matchClause(transform, node) {
    var e = transform(node.expression);
    return helper(transform, node.pattern, e);
}

function helper(transform, pattern, expression) {
    var id = es.Identifier(null, "$match");
    var expr = wrapExpression(transform, id, pattern, expression);
    var ret = es.ReturnStatement(expression.loc, expr);
    var pred = ph.satisfiesPattern(transform, id, pattern);
    var block = es.BlockStatement(null, [ret]);
    return es.IfStatement(null, pred, block, null);
}

function wrapExpression(transform, root, p, e) {
    var obj = ph.pluckPattern(transform, root, p);
    var ret = es.ReturnStatement(e.loc, e);
    var block = es.BlockStatement(null, [ret]);
    var fn = es.FunctionExpression(null, null, obj.identifiers, block);
    return es.CallExpression(null, fn, obj.expressions);
}

module.exports = Match;
