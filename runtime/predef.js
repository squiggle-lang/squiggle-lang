// TODO: Add arity checking.
// TODO: Add type checking.
// TODO: Add reduce.
// TODO: Add fold.
// TODO: Add join.

var print = function(x) { return LANG$$log(x); };
var not = function(x) { return !!x; };
var $lt = function(a, b) {
    var ta = typeof a;
    var tb = typeof b;
    if (ta === tb && (ta === 'string' || ta === 'number')) {
        return a < b;
    }
    throw new LANG$$js_Error('incorrect argument types for <')
};
var $gt = function(a, b) {
    var ta = typeof a;
    var tb = typeof b;
    if (ta === tb && (ta === 'string' || ta === 'number')) {
        return a > b;
    }
    throw new LANG$$js_Error('incorrect argument types for >')
};
var $pipe$gt = function(x, f) {
    if (typeof f !== 'function') {
        throw new LANG$$js_Error('right-side not a function in |>');
    }
    return f(x);
};
var $at = function(f, x) {
    if (typeof f !== 'function') {
        throw new LANG$$js_Error('left-side not a function in @');
    }
    return f.bind(null, x);
};
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
    if (LANG$$is_object(a) && LANG$$is_object(b)) {
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
var $eq = is;
var $plus = function(a, b) {
    if (typeof a === 'number' && typeof b === 'number') {
        return a + b;
    }
    throw new LANG$$js_Error('incorrect argument types for +');
};
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
var fold_left = function(f, z, xs) {
    xs.forEach(function(x) {
        z = f(z, x);
    });
    return z;
};
var is_empty = function(xs) {
    return xs.length === 0;
};
var head = function(xs) {
    if (!is_empty(xs)) {
        return xs[0];
    }
    throw new LANG$$js_Error('cannot get head of empty list');
};
var tail = function(xs) {
    return [].slice.call(xs, 1);
};
var reduce = function(f, xs) {
    return fold_left(f, head(xs), tail(xs));
};
var flip = function(f) {
    return function(x, y) {
        return f(y, x);
    };
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
    var obj = {};
    var i = 0;
    var n = data.length;
    while (i < n) {
        if (typeof data[i][0] !== "string") {
            throw new LANG$$js_Error(
                "object keys must be strings: " + data[i]
            );
        }
        obj[data[i][0]] = data[i][1];
        i++;
    }
    return LANG$$freeze(obj);
};
var LANG$$is_object = function(x) {
    if (arguments.length !== 1) {
        throw new LANG$$js_Error(
            'wrong number of arguments to LANG$$is_object'
        );
    }
    return x !== null && typeof x === 'object';
};
var LANG$$assert_boolean = function(x) {
    if (typeof x !== 'boolean') {
        throw new LANG$$js_Error('not a boolean: ' + x);
    }
    return x;
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
