"use strict";

var es = require("../es");
var ast = require("../ast");

function Call(transform, node) {
    // If the function being called comes from a "GetProperty", that means we're
    // looking at a method invocation, like `foo.bar()` rather than just a
    // normal function invocation like `goop()`, so transform this node into a
    // `ast.CallMethod` and let it do the work.
    if (node.f.type === "GetProperty") {
        var obj = node.f.obj;
        var prop = node.f.prop;
        var cmArgs = node.args;
        var cmNode = ast.CallMethod(node.f.loc, obj, prop, cmArgs);
        return transform(cmNode);
    }
    var f = transform(node.f);
    var args = node.args.map(transform);
    return es.CallExpression(node.f.loc, f, args);
}

module.exports = Call;
