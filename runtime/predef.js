// TODO: Add arity checking.
// TODO: Add type checking.

// MDN polyfill for `Object.is`.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
var $_is = Object.is || function(x, y) {
    // SameValue algorithm
    if (x === y) { // Steps 1-5, 7-10
        // Steps 6.b-6.e: +0 != -0
        return x !== 0 || 1 / x === 1 / y;
    } else {
        // Step 6.a: NaN == NaN
        return x !== x && y !== y;
    }
};
var $is = function(a, b) {
    if (arguments.length !== 2) {
        throw new $Error('wrong number of arguments to $is');
    }
    return $_is(a, b);
};

var $Object = Object;
var $preventExtensions = Object.preventExtensions;
var $isFrozen = Object.isFrozen;
var $freeze = Object.freeze;
var $create = Object.create;
var $isArray = Array.isArray;
var $keys = Object.keys;
var $isArray = Array.isArray;
var $getPrototypeOf = Object.getPrototypeOf;
var $Error = Error;
var $ReferenceError = ReferenceError;
var $undef = {_: "SQUIGGLE_TEMPORAL_DEADZONE_VALUE"};

var $ref = function $ref(x, name) {
    if (x === $undef) {
        throw new $ReferenceError(name + " used before initialization");
    }
    return x;
};
var $isObject = function(x) {
    if (arguments.length !== 1) {
        throw new $Error('wrong number of arguments to $isObject');
    }
    return x && typeof x === "object";
};
var $slice = function(xs, i) {
    if (arguments.length !== 2) {
        throw new $Error('wrong number of arguments to $slice');
    }
    return Array.prototype.slice.call(xs, i);
};
var $array = function() {
    return $freeze($slice(arguments, 0));
};
var $lt = function(a, b) {
    if (arguments.length !== 2) {
        throw new $Error('wrong number of arguments to $lt');
    }
    $number(a);
    $number(b);
    return a < b;
};
var $gt = function(a, b) {
    if (arguments.length !== 2) {
        throw new $Error('wrong number of arguments to $gt');
    }
    $number(a);
    $number(b);
    return a > b;
};
var $lte = function(a, b) {
    if (arguments.length !== 2) {
        throw new $Error('wrong number of arguments to $lte');
    }
    return $lt(a, b) || $eq(a, b);
};
var $gte = function(a, b) {
    if (arguments.length !== 2) {
        throw new $Error('wrong number of arguments to $gte');
    }
    return $gt(a, b) || $eq(a, b);
};
var $neq = function(a, b) {
    if (arguments.length !== 2) {
        throw new $Error('wrong number of arguments to $neq');
    }
    return !$eq(a, b);
};
var $eq = function $eq(a, b) {
    if (arguments.length !== 2) {
        throw new $Error('wrong number of arguments to $eq');
    }
    if (typeof a !== typeof b) {
        return false;
    }
    if (a === b) {
        return true;
    }
    // TODO: `NaN`s should not be equal under `=`, only `is`.
    if (a !== a && b !== b) {
        return true;
    }
    // TODO: Only check arrays based on their numeric keys.
    if ($isObject(a) && $isObject(b)) {
        // TODO: Remove duplicates.
        var ks = $keys(a).concat($keys(b)).sort();
        return ks.every(function(k) {
            return (
                k in a &&
                k in b &&
                $eq(a[k], b[k])
            );
        });
    }
    return false;
};
var $add = function(a, b) {
    if (arguments.length !== 2) {
        throw new $Error('wrong number of arguments to $add');
    }
    $number(a);
    $number(b);
    return a + b;
};
var $concat = function(a, b) {
    if (arguments.length !== 2) {
        throw new $Error('wrong number of arguments to $concat');
    }
    if (typeof a === 'string' && typeof b === 'string') {
        return a + b;
    }
    if ($isArray(a) && $isArray(b)) {
        return a.concat(b);
    }
    throw new $Error('incorrect argument types for ++');
};
var $subtract = function(a, b) {
    if (arguments.length !== 2) {
        throw new $Error('wrong number of arguments to $subtract');
    }
    $number(a);
    $number(b);
    return a - b;
};
var $multiply = function(a, b) {
    if (arguments.length !== 2) {
        throw new $Error('wrong number of arguments to $multiply');
    }
    $number(a);
    $number(b);
    return a * b;
};
var $divide = function(a, b) {
    if (arguments.length !== 2) {
        throw new $Error('wrong number of arguments to $divide');
    }
    $number(a);
    $number(b);
    return a / b;
};
var $not = function(x) {
    if (arguments.length !== 1) {
        throw new $Error('wrong number of arguments to $not');
    }
    return !$bool(x);
};
var $negate = function(x) {
    if (arguments.length !== 1) {
        throw new $Error('wrong number of arguments to $negate');
    }
    return -$number(x);
};
var freezeAfter = function(x, f) {
    if (arguments.length !== 2) {
        throw new $Error('wrong number of arguments to freezeAfter');
    }
    f(x);
    return $freeze(x);
};
var map = function(f, xs) {
    if (arguments.length !== 2) {
        throw new $Error('wrong number of arguments to map');
    }
    var ys = [];
    for (var i = 0, n = xs.length; i < n; i++) {
        ys.push(f(xs[i]));
    }
    return $freeze(ys);
};
var join = function(items, separator) {
    if (arguments.length !== 2) {
        throw new $Error('wrong number of arguments to join');
    }
    return [].join.call(items, separator);
};
var foldLeft = function(xs, z, f) {
    if (arguments.length !== 3) {
        throw new $Error('wrong number of arguments to foldLeft');
    }
    var y = z;
    for (var i = 0, n = xs.length; i < n; i++) {
        y = f(y, xs[i]);
    }
    return y;
};
var fold = foldLeft;
var isEmpty = function(xs) {
    if (arguments.length !== 1) {
        throw new $Error('wrong number of arguments to isEmpty');
    }
    return xs.length === 0;
};
var filter = function(xs, f) {
    if (arguments.length !== 2) {
        throw new $Error('wrong number of arguments to filter');
    }
    var ys = [];
    for (var i = 0, n = xs.length; i < n; i++) {
        if (f(xs[i])) {
            ys.push(xs[i]);
        }
    }
    return $freeze(ys);
};
var head = function(xs) {
    if (arguments.length !== 1) {
        throw new $Error("wrong number of arguments to head");
    }
    if (xs.length === 0) {
        throw new $Error('cannot get head of empty list');
    }
    return xs[0];
};
var tail = function(xs) {
    if (arguments.length !== 1) {
        throw new $Error("wrong number of arguments to tail");
    }
    return $slice(xs, 1);
};
var reduce = function(xs, f) {
    if (arguments.length !== 2) {
        throw new $Error("wrong number of arguments to reduce");
    }
    return foldLeft(head(xs), tail(xs), f);
};
var foldRight = function(xs, z, f) {
    if (arguments.length !== 3) {
        throw new $Error("wrong number of arguments to foldRight");
    }
    return foldLeft(reverse(xs), z, flip(f));
};
var reverse = function(xs) {
    if (arguments.length !== 1) {
        throw new $Error("wrong number of arguments to reverse");
    }
    return toArray(xs).reverse();
};
var toArray = function(xs) {
    if (arguments.length !== 1) {
        throw new $Error("wrong number of arguments to toArray");
    }
    return $slice(xs, 0);
};
var flip = function(f) {
    if (arguments.length !== 1) {
        throw new $Error("wrong number of arguments to toString");
    }
    return function(x, y) {
        return f(y, x);
    };
};
var toString = function(x) {
    if (arguments.length !== 1) {
        throw new $Error("wrong number of arguments to toString");
    }
    if (x) {
        if (x.toString) {
            return x.toString();
        } else {
            return '{WEIRD_OBJECT}';
        }
    } else {
        return '' + x;
    }
};
var denew = function(Class) {
    if (arguments.length !== 1) {
        throw new $Error("wrong number of arguments to denew");
    }
    return function WrappedConstructor() {
        var args = toArray(arguments);
        var f = Class.bind.apply(Class, [Class].concat(args));
        return new f;
    };
};
var $get = function(obj, k) {
    if (arguments.length !== 2) {
        throw new $Error("wrong number of arguments to get");
    }
    if (obj === null || obj === undefined) {
        throw new $Error('cannot get ' + k + ' of ' + obj);
    }
    if (k in Object(obj)) {
        return obj[k];
    }
    throw new $Error('key ' + k + ' not in ' + toString(obj));
};
var set = function(obj, k, v) {
    if (arguments.length !== 3) {
        throw new $Error("wrong number of arguments to set");
    }
    if (obj === null || typeof obj !== 'object') {
        throw new $Error('cannot set ' + k + ' on ' + toString(obj));
    }
    if ($isFrozen(obj)) {
        throw new $Error('cannot set ' + k + ' on frozen object');
    }
    obj[k] = v;
    return obj;
};
var typeOf = function typeOf(x) {
    if (arguments.length !== 1) {
        throw new $Error("wrong number of arguments to typeOf");
    }
    if (x === null) {
        return "null"
    }
    if ($isArray(x)) {
        return "array";
    }
    return typeof x;
};
var $method = function(obj, method) {
    if (arguments.length !== 2) {
        throw new $Error("wrong number of arguments to $method");
    }
    return obj[method].bind(obj);
};
var $update = function(a, b) {
    if (arguments.length !== 2) {
        throw new $Error("wrong number of arguments to update");
    }
    var c = $create($getPrototypeOf(a));
    $keys(a).forEach(function(k) { c[k] = a[k]; });
    $keys(b).forEach(function(k) { c[k] = b[k]; });
    return $freeze(c);
};
var $object = function() {
    if (arguments.length % 2 !== 0) {
        throw new $Error('objects must have an even number of items');
    }
    var obj = {};
    var i = 0;
    var n = arguments.length - 1;
    while (i < n) {
        if (typeof arguments[i] !== "string") {
            throw new $Error("object keys must be strings: " + arguments[i]);
        }
        obj[arguments[i]] = arguments[i + 1];
        i += 2;
    }
    return $freeze(obj);
};
var $bool = function(x) {
    if (arguments.length !== 1) {
        throw new $Error('wrong number of arguments to $bool');
    }
    if (typeof x !== 'boolean') {
        throw new $Error('not a boolean: ' + toString(x));
    }
    return x;
};
var $number = function(x) {
    if (arguments.length !== 1) {
        throw new $Error('wrong number of arguments to $number');
    }
    if (typeof x !== 'number') {
        throw new $Error('not a number: ' + toString(x));
    }
    return x;
};

var undefined = void 0;
var global = (1, eval)("this");

var update = $update;
var get = $get;
var is = $is;
