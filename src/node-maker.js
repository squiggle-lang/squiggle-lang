function f(type, props) {
    return function() {
        var obj = {};
        var args = arguments;
        if (args.length !== props.length) {
            throw new Error("wrong number of arguments for AST node " + type);
        }
        obj.type = type;
        props.forEach(function(p, i) {
            obj[p] = args[i];
        });
        return obj;
        // return Object.freeze(obj);
    };
}

function nm(ast) {
    Object
    .keys(ast)
    .forEach(function(k) {
        ast[k] = f(k, ast[k]);
    });
    return ast;
}

module.exports = nm;
