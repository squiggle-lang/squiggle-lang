"use strict";

var es = require("../es");

function CallMethod(transform, node) {
    var obj = transform(node.obj);
    var prop = transform(node.prop);
    var method = es.MemberExpression(node.prop.loc, true, obj, prop);
    var args = node.args.map(transform);
    return es.CallExpression(node.prop.loc, method, args);
}

module.exports = CallMethod;
