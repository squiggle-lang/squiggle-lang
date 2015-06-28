var traverse = require("./traverse");

function lint(ast) {
    traverse.walk({
        enter: function(node) {
            console.error('entering ' + node.type);
            if (node.type === 'Root') {
                return traverse.SKIP;
            }
            // console.error(node);
        },
        exit: function(node) {
            // console.error('exiting ' + node.type);
        }
    }, ast);
    // noUnusedLetBindings(ast);
}

module.exports = lint;
