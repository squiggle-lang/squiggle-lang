var $global = (1, eval)("this");
var $isFrozen = Object.isFrozen;
var $freeze = Object.freeze;
var $create = Object.create;
var $isArray = Array.isArray;
var $keys = Object.keys;
var $getPrototypeOf = Object.getPrototypeOf;
var $Error = Error;
var $ReferenceError = ReferenceError;
var $undef = {_: "SQUIGGLE_TEMPORAL_DEADZONE_VALUE"};
function $is(x, y) {
    if (x === y) {
        return x !== 0 || 1 / x === 1 / y;
    } else {
        return x !== x && y !== y;
    }
}
function $has(obj, key) { return key in obj; }
function $ref(x, name) {
    if (x === $undef) {
        throw new $ReferenceError(name + " used before initialization");
    }
    return x;
}
function $isObject(x) { return x && typeof x === "object"; }
function $slice(xs, i) { return Array.prototype.slice.call(xs, i); }
function $array() { return $freeze($slice(arguments, 0)); }
// TODO: Allow comparison ops for strings also.
function $lt(a, b) { return $number(a) < $number(b); }
function $gt(a, b) { return $number(a) > $number(b); }
function $lte(a, b) { return $lt(a, b) || $eq(a, b); }
function $gte(a, b) { return $gt(a, b) || $eq(a, b); }
function $neq(a, b) { return !$eq(a, b); }
function $eq(a, b) {
    if (a === b) {
        return true;
    } else if ($isArray(a) && $isArray(b)) {
        var n = a.length;
        var m = b.length;
        if (n !== m) {
            return false;
        } else {
            for (var i = 0; i < n; i++) {
                if (!$eq(a[i], b[i])) {
                    return false;
                }
            }
            return true;
        }
    } else if ($isObject(a) && $isObject(b)) {
        // TODO: Remove duplicates.
        var ks = $keys(a).concat($keys(b)).sort();
        return ks.every(function(k) {
            return k in a && k in b && $eq(a[k], b[k]);
        });
    } else {
        return false;
    }
}
function $concat(a, b) {
    if (typeof a === 'string' && typeof b === 'string') {
        return a + b;
    }
    if ($isArray(a) && $isArray(b)) {
        return a.concat(b);
    }
    throw new $Error('incorrect argument types for ++');
}
function $add(a, b) { return $number(a) + $number(b); }
function $subtract(a, b) { return $number(a) - $number(b); }
function $multiply(a, b) { return $number(a) * $number(b); }
function $divide(a, b) { return $number(a) / $number(b); }
function $not(x) { return !$bool(x); }
function $negate(x) { return -$number(x); }
function $get(obj, k) {
    if (obj === null || obj === undefined) {
        throw new $Error('cannot get ' + k + ' of ' + obj);
    }
    if ($has(obj, k)) {
        return obj[k];
    }
    throw new $Error('key ' + k + ' not in ' + toString(obj));
}
// TODO: Expose this in the language.
function $set(obj, k, v) {
    if (obj === null || typeof obj !== 'object') {
        throw new $Error('cannot set ' + k + ' on ' + toString(obj));
    }
    if ($isFrozen(obj)) {
        throw new $Error('cannot set ' + k + ' on frozen object');
    }
    obj[k] = v;
    return obj;
}
// TODO: Expose this in the language.
function $type(x) {
    if (x === null) {
        return "null"
    }
    if ($isArray(x)) {
        return "array";
    }
    return typeof x;
}
function $method(obj, method) {
    return obj[method].bind(obj);
}
function $update(a, b) {
    var c = $create($getPrototypeOf(a));
    $keys(a).forEach(function(k) { c[k] = a[k]; });
    $keys(b).forEach(function(k) { c[k] = b[k]; });
    return $freeze(c);
}
function $object() {
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
}
function $bool(x) {
    if (typeof x !== 'boolean') {
        throw new $Error('not a boolean: ' + toString(x));
    }
    return x;
}
function $number(x) {
    if (typeof x !== 'number') {
        throw new $Error('not a number: ' + toString(x));
    }
    return x;
}
