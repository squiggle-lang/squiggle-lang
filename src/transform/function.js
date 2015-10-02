var flatten = require("lodash/array/flatten");
var esprima = require("esprima");

var ast = require("../ast");
var es = require("../es");

function declareAssign(id, expr) {
    var init = es.VariableDeclarator(id, expr);
    return es.VariableDeclaration('var', [init]);
}

function Function_(transform, node) {
    var name = node.name ?
        transform(node.name) :
        null;
    var positional = node.parameters.positional || [];
    var params = positional
        .map(function(x, i) {
            var n = i + 1;
            var name = x.identifier.data;
            if (name === "_") {
                return "$" + n;
            } else {
                return name;
            }
        })
        .map(function(name) { return ast.Identifier(name); })
        .map(transform);
    var n = params.length;
    var context = node.parameters.context;
    var bindContext = context ?
        [declareAssign(transform(context), es.ThisExpression())] :
        [];
    var slurpy = node.parameters.slurpy;
    var getSlurpy =
        es.CallExpression(
            es.Identifier("$slice"),
            [es.Identifier("arguments"), es.Literal(n)]
        );
    var bindSlurpy = slurpy ?
        [declareAssign(transform(slurpy), getSlurpy)] :
        [];
    var bodyExpr = transform(node.body);
    var returnExpr = es.ReturnStatement(bodyExpr);
    var op = slurpy ? "<" : "!==";
    var arityCheck = esprima.parse(
        "if (arguments.length " + op + " " + n + ") { " +
        "throw new $Error(" +
            "'expected " + n + " argument(s), " +
            "got ' + arguments.length" +
            "); " +
        "}"
    ).body;
    // Argument count will never be less than zero, so remove the
    // conditional entirely.
    if (n === 0 && slurpy) {
        arityCheck = [];
    }
    var body = flatten([
        arityCheck,
        bindContext,
        bindSlurpy,
        returnExpr
    ]);
    var block = es.BlockStatement(body);
    var innerFn = es.FunctionExpression(name, params, block);
    // React is a jerk and wants to mutate function objects a lot. Maybe one
    // day we can go back to freezing them, but until then, we'll play nice
    // with React.
    return innerFn;
}

module.exports = Function_;
