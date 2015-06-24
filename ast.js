function nm(type, props) {
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
        return Object.freeze(obj);
    };
}

var ast = {
    Root:        ["expr"],
    GetProperty: ["obj", "prop"],
    Identifier:  ["data"],
    Call:        ["f", "args"],
    Function:    ["parameters", "body"],
    If:          ["p", "t", "f"],
    Let:         ["bindings", "expr"],
    List:        ["data"],
    Map:         ["data"],
    Number:      ["data"],
    String:      ["data"],
};

Object.keys(ast).forEach(function(k) {
    ast[k] = nm(k, ast[k]);
})

module.exports = ast;
