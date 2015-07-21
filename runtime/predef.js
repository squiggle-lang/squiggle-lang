// TODO: Add arity checking.
// TODO: Add type checking.

var undefined = void 0;
var global = (1, eval)("this");
var print = function(x) { return sqgl$$log(x); };
var not = function(x) { return !!x; };
var $lt = function(a, b) {
    var ta = typeof a;
    var tb = typeof b;
    if (ta === tb && (ta === 'string' || ta === 'number')) {
        return a < b;
    }
    throw new sqgl$$Error('incorrect argument types for <')
};
var $gt = function(a, b) {
    var ta = typeof a;
    var tb = typeof b;
    if (ta === tb && (ta === 'string' || ta === 'number')) {
        return a > b;
    }
    throw new sqgl$$Error('incorrect argument types for >')
};
var $lt$eq = function(a, b) {
    return $lt(a, b) || a === b;
};
var $gt$eq = function(a, b) {
    return $gt(a, b) || a === b;
};
var $bang$eq = function(a, b) {
    return not($eq(a, b));
};
var not = function(x) {
    return !sqgl$$assertBoolean(x);
};
var $pipe$gt = function(x, f) {
    if (typeof f !== 'function') {
        throw new sqgl$$Error('right-side not a function in |>');
    }
    return f(x);
};
var $at = function(f, x) {
    if (typeof f !== 'function') {
        throw new sqgl$$Error('left-side not a function in @');
    }
    return f.bind(null, x);
};
var $ampersand = function(a, b) {
    if (arguments.length !== 2) {
        throw new sqgl$$Error('wrong number of arguments for &');
    }
    return (
        sqgl$$assertBoolean(a) &&
        sqgl$$assertBoolean(b)
    );
};
var $semicolon = function(a, b) {
    return b;
};
var $pipe = function(a, b) {
    if (arguments.length !== 2) {
        throw new sqgl$$Error('wrong number of arguments for |');
    }
    return (
        sqgl$$assertBoolean(a) ||
        sqgl$$assertBoolean(b)
    );
};
var $eq = function recur(a, b) {
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
    if (sqgl$$isObject(a) && sqgl$$isObject(b)) {
        // TODO: Remove duplicates.
        var ks = sqgl$$keys(a).concat(sqgl$$keys(b)).sort();
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
var isNan = function(x) {
    return x !== x;
};
var $plus = function(a, b) {
    if (typeof a === 'number' && typeof b === 'number') {
        return a + b;
    }
    throw new sqgl$$Error('incorrect argument types for +');
};
var $plus$plus = function(a, b) {
    var A = Array.isArray;
    var S = function(x) { return typeof x === 'string'; };
    var aOk = A(a) && A(b);
    var sOk = S(a) && S(b)
    if (aOk || sOk) {
        return a.concat(b);
    }
    throw new sqgl$$Error('incorrect argument types for ++');
};
var $minus = function(a, b) {
    return a - b;
};
var $star = function(a, b) {
    return a * b;
};
var $slash = function(a, b) {
    return a / b;
};
var map = function(f, xs) {
    return xs.map(function(x) {
        return f(x);
    });
};
var join = function(separator, items) {
    return [].join.call(items, separator);
};
var foldLeft = function(f, z, xs) {
    xs.forEach(function(x) {
        z = f(z, x);
    });
    return z;
};
var fold = foldLeft;
var isEmpty = function(xs) {
    return xs.length === 0;
};
var head = function(xs) {
    if (!isEmpty(xs)) {
        return xs[0];
    }
    throw new sqgl$$Error('cannot get head of empty list');
};
var tail = function(xs) {
    return [].slice.call(xs, 1);
};
var reduce = function(f, xs) {
    return foldLeft(f, head(xs), tail(xs));
};
var foldRight = function(f, z, xs) {
    return foldLeft(flip(f), z, reverse(xs));
};
var reverse = function(xs) {
    return toArray(xs).reverse();
};
var toArray = function(xs) {
    return [].slice.call(xs);
};
var flip = function(f) {
    return function(x, y) {
        return f(y, x);
    };
};
var get = function(k, obj) {
    if (k in obj) {
        return obj[k];
    }
    throw new sqgl$$Error('key ' + k + ' not in ' + obj);
};
var set = function(k, v, obj) {
    if (obj === null || typeof obj !== 'object') {
        throw new sqgl$$Error('cannot set ' + k + ' on ' + obj);
    }
    obj[k] = v;
    return obj;
};
var methodGet = function(method, obj) {
    return obj[method].bind(obj);
};
var methodCall = function(method, obj, args) {
    return obj[method].apply(obj, args);
};
var sqgl$$object = function(data) {
    if (!sqgl$$isArray(data)) {
        throw new sqgl$$Error(
            'objects can only be constructed from an array'
        );
    }
    var obj = {};
    var i = 0;
    var n = data.length;
    while (i < n) {
        if (typeof data[i][0] !== "string") {
            throw new sqgl$$Error(
                "object keys must be strings: " + data[i]
            );
        }
        obj[data[i][0]] = data[i][1];
        i++;
    }
    return sqgl$$freeze(obj);
};
var sqgl$$isObject = function(x) {
    if (arguments.length !== 1) {
        throw new sqgl$$Error(
            'wrong number of arguments to sqgl$$isObject'
        );
    }
    return x !== null && typeof x === 'object';
};
var sqgl$$assertBoolean = function(x) {
    if (typeof x !== 'boolean') {
        throw new sqgl$$Error('not a boolean: ' + x);
    }
    return x;
};
var sqgl$$freeze = Object.freeze;
var sqgl$$create = Object.create;
var sqgl$$isArray = Array.isArray;
var sqgl$$keys = Object.keys;
var sqgl$$get = get;
var sqgl$$methodGet = methodGet;
var sqgl$$methodCall = methodCall;
var sqgl$$Error = Error;
var sqgl$$customLogger = null;
var sqgl$$global = global;
var sqgl$$log = function(x) {
    if (sqgl$$customLogger) {
        sqgl$$customLogger(x);
    } else if (sqgl$$global.console && sqgl$$global.console.log) {
        sqgl$$global.console.log(x);
    }
    return x;
};
