// TODO: Delete this file.

// var es = require("../es");

// function mapLastSpecial(f, g, xs) {
//     var n = xs.length;
//     var ys = xs.slice(0, n - 1).map(function(x) {
//         return f(x);
//     });
//     var y = g(xs[n - 1]);
//     return ys.concat([y]);
// }

function Block(transform, node) {
    throw new Error("DON'T USE ME.");
    // var exprs = node
    //     .expressions
    //     .map(transform);
    // var statements =
    //     mapLastSpecial(
    //         es.ExpressionStatement,
    //         es.ReturnStatement,
    //         exprs
    //     );
    // var block = es.BlockStatement(statements);
    // var fn = es.FunctionExpression(null, [], block);
    // return es.CallExpression(fn, []);
}

module.exports = Block;
