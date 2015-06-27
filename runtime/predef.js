// TODO: Add arity checking.
// TODO: Add type checking.
// TODO: Add reduce.
// TODO: Add fold.
// TODO: Add join.

var print = function(x) { return LANG$$log(x); };
var not = function(x) { return !!x; };
var $lt = function(a, b) { return a < b; };
var $gt = function(a, b) { return a > b; };
var is = function recur(a, b) {
    if (typeof a !== typeof b) {
        return false;
    }
    if (a === b) {
        return true;
    }
    // Check if both values are NaN.
    if (a !== a && b !== b) {
        return true;
    }
    if (typeof a === 'object' && typeof b === 'object') {
        // TODO: Remove duplicates.
        var ks = LANG$$keys(a).concat(LANG$$keys(b)).sort();
        return ks.every(function(k) {
            return (
                k in a &&
                k in b &&
                recur(a[k], b[k])
            );
        });
    }
    return false;
};
var $plus = function(a, b) { return a + b; };
var $plus$plus = function(a, b) {
    var A = Array.isArray;
    var S = function(x) { return typeof x === 'string'; };
    var aOk = A(a) && A(b);
    var sOk = S(a) && S(b)
    if (aOk || sOk) {
        return a.concat(b);
    }
    throw new LANG$$js_Error('incorrect argument types for ++');
};
var $minus = function(a, b) { return a - b; };
var $star = function(a, b) { return a * b; };
var $slash = function(a, b) { return a / b; };
var map = function(f, xs) {
    return xs.map(function(x) {
        return f(x);
    });
};
var js_get = function(k, obj) {
    if (k in obj) {
        return obj[k];
    }
    throw new LANG$$js_Error('key ' + k + ' not in ' + obj);
};
var js_set = function(k, v, obj) {
    if (obj === null || typeof obj !== 'object') {
        throw new LANG$$js_Error('cannot set ' + k + ' on ' + obj);
    }
    obj[k] = v;
    return obj;
};
var js_method_get = function(method, obj) {
    return obj[method].bind(obj);
};
var js_method_call = function(method, obj, args) {
    return obj[method].apply(obj, args);
};
var LANG$$object = function(data) {
    if (!LANG$$is_array(data)) {
        throw new LANG$$js_Error(
            'objects can only be constructed from an array'
        );
    }
    if (data.length % 2 !== 0) {
        throw new LANG$$js_Error(
            'unbalanced key-value pairs for object'
        );
    }
    var obj = {};
    var i = 0;
    var j = 1;
    var n = data.length;
    while (j < n) {
        if (typeof data[i] !== "string") {
            throw new LANG$$js_Error(
                "object keys must be strings: " + data[i]
            );
        }
        obj[data[i]] = data[j];
        i += 2;
        j += 2;
    }
    return LANG$$freeze(obj);
};
var LANG$$freeze = Object.freeze;
var LANG$$create = Object.create;
var LANG$$is_array = Array.isArray;
var LANG$$keys = Object.keys;
var LANG$$js_get = js_get;
var LANG$$js_method_get = js_method_get;
var LANG$$js_method_call = js_method_call;
var LANG$$js_Error = Error;
var LANG$$custom_logger = null;
var LANG$$global = (1, eval)("this");
var LANG$$log = function(x) {
    if (LANG$$custom_logger) {
        LANG$$custom_logger(x);
    } else if (LANG$$global.console && LANG$$global.console.log) {
        LANG$$global.console.log(x);
    }
    return x;
};
