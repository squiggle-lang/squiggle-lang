module.exports = {
    add: {
        dependencies: ['number'],
        code: 'function $add(a, b) { return $number(a) + $number(b); }'
    },
    array: {
        dependencies: ['slice'],
        code: [
            'function $array() { ',
            '   return Object.freeze($slice(arguments, 0));',
            '}'
        ].join("\n")
    },
    bool: {
        dependencies: [],
        code: [
            'function $bool(x) {',
            '    if (typeof x !== "boolean") {',
            '        throw new Error("not a boolean: " + x);',
            '    }',
            '    return x;',
            '}'
        ].join("\n")
    },
    concat: {
        dependencies: [],
        code: [
            'function $concat(a, b) {' +
            '    if (typeof a === "string" && typeof b === "string") {' +
            '        return a + b;' +
            '    }' +
            '    if (Array.isArray(a) && Array.isArray(b)) {' +
            '        return a.concat(b);' +
            '    }' +
            '    throw new Error("incorrect argument types for ++");' +
            '}'
        ].join("\n")
    },
    divide: {
        dependencies: ['number'],
        code: 'function $divide(a, b) { return $number(a) / $number(b); }'
    },
    eq: {
        dependencies: ['isObject'],
        code: [
            'function $eq(a, b) {',
            '    if (a === b) {',
            '        return true;',
            '    } else if (Array.isArray(a) && Array.isArray(b)) {',
            '        var n = a.length;',
            '        var m = b.length;',
            '        if (n !== m) {',
            '            return false;',
            '        } else {',
            '            for (var i = 0; i < n; i++) {',
            '                if (!$eq(a[i], b[i])) {',
            '                    return false;',
            '                }',
            '            }',
            '            return true;',
            '        }',
            '    } else if ($isObject(a) && $isObject(b)) {',
            '        // TODO: Remove duplicates.',
            '        var ks = Object.keys(a).concat(Object.keys(b)).sort();',
            '        return ks.every(function(k) {',
            '            return k in a && k in b && $eq(a[k], b[k]);',
            '        });',
            '    } else {',
            '        return false;',
            '    }',
            '}'
        ].join("\n")
    },
    get: {
        dependencies: [],
        code: [
            'function $get(obj, k) {',
            '    if (obj === null || obj === undefined) {',
            '        throw new Error("cannot get " + k + " of " + obj);',
            '    }',
            '    var v = obj[k];',
            '    if (v !== undefined) {',
            '        return v;',
            '    }',
            '    throw new Error("key " + k + " is undefined in " + obj);',
            '}'
        ].join("\n")
    },
    global: {
        dependencies: [],
        code: 'var $global = (1, eval)("this");'
    },
    gt: {
        // TODO: Make it work on strings too
        dependencies: ['number'],
        code: 'function $gt(a, b) { return $number(a) > $number(b); }'
    },
    gte: {
        dependencies: ['gt', 'eq'],
        code: 'function $gte(a, b) { return $gt(a, b) || $eq(a, b); }'
    },
    has: {
        dependencies: [],
        code: 'function $has(obj, key) { return obj[key] !== undefined; }'
    },
    is: {
        dependencies: [],
        code: [
            'function $is(x, y) {',
            '    if (x === y) {',
            '        return x !== 0 || 1 / x === 1 / y;',
            '    } else {',
            '        return x !== x && y !== y;',
            '    }',
            '}'
        ].join("\n")
    },
    isObject: {
        dependencies: [],
        code: 'function $isObject(x) { return x && typeof x === "object"; }'
    },
    lt: {
        // TODO: Make it work on strings too
        dependencies: ['number'],
        code: 'function $lt(a, b) { return $number(a) < $number(b); }'
    },
    lte: {
        dependencies: ['lt', 'eq'],
        code: 'function $lte(a, b) { return $lt(a, b) || $eq(a, b); }'
    },
    method: {
        dependencies: [],
        code: 'function $method(obj, method) { return obj[method].bind(obj); }'
    },
    multiply: {
        dependencies: ['number'],
        code: 'function $multiply(a, b) { return $number(a) * $number(b); }'
    },
    negate: {
        dependencies: ['number'],
        code: 'function $negate(x) { return -$number(x); }'
    },
    neq: {
        dependencies: ['eq'],
        code: 'function $neq(a, b) { return !$eq(a, b); }'
    },
    not: {
        dependencies: ['bool'],
        code: 'function $not(x) { return !$bool(x); }'
    },
    number: {
        dependencies: [],
        code: [
            'function $number(x) {',
            '    if (typeof x !== "number") {',
            '        throw new Error("not a number: " + x);',
            '    }',
            '    return x;',
            '}'
        ].join("\n")
    },
    object: {
        dependencies: [],
        code: [
'function $object() {',
'    if (arguments.length % 2 !== 0) {',
'        throw new Error("objects must have an even number of items");',
'    }',
'    var obj = {};',
'    var i = 0;',
'    var n = arguments.length - 1;',
'    while (i < n) {',
'        if (typeof arguments[i] !== "string") {',
'            throw new Error("object keys must be strings: " + arguments[i]);',
'        }',
'        obj[arguments[i]] = arguments[i + 1];',
'        i += 2;',
'    }',
'    return Object.freeze(obj);',
'}'
].join("\n")
    },
    ref: {
        dependencies: ['undef'],
        code:
            'function $ref(x, name) {' +
            '    if (x === $undef) {' +
            '        throw new ReferenceError(' +
            'name + " used before initialization");' +
            '    }' +
            '    return x;' +
            '}'
    },
    set: {
        dependencies: [],
        code:
// TODO: Expose this in the language.
'function $set(obj, k, v) {' +
'    if (obj === null || typeof obj !== "object") {' +
'        throw new Error("cannot set " + k + " on " + obj);' +
'    }' +
'    if (Object.isFrozen(obj)) {' +
'        throw new Error("cannot set " + k + " on frozen object");' +
'    }' +
'    obj[k] = v;' +
'    return obj;' +
'}'
    },
    slice: {
        dependencies: [],
        code: 'function $slice(xs, i) { ' +
            'return Array.prototype.slice.call(xs, i); }'
    },
    subtract: {
        dependencies: ['number'],
        code: 'function $subtract(a, b) { return $number(a) - $number(b); }'
    },
    type: {
        dependencies: [],
        code:
            // TODO: Expose this in the language.
            'function $type(x) {' +
            '    if (x === null) {' +
            '        return "null"' +
            '    }' +
            '    if (Array.isArray(x)) {' +
            '        return "array";' +
            '    }' +
            '    return typeof x;' +
            '}'
    },
    undef: {
        dependencies: [],
        code: 'var $undef = {_: "SQUIGGLE_TEMPORAL_DEADZONE_VALUE"};'
    },
    update: {
        dependencies: [],
        code:
            'function $update(a, b) {' +
            '    var c = Object.create(Object.getPrototypeOf(a));' +
            '    Object.keys(a).forEach(function(k) { c[k] = a[k]; });' +
            '    Object.keys(b).forEach(function(k) { c[k] = b[k]; });' +
            '    return Object.freeze(c);' +
            '}'
    }
};
