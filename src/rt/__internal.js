function argN(n, m) {
  if (m !== n) {
    throw new Error("expected " + n + " argument(s), got " + m);
  }
}

function argNPlus(n, m) {
  if (m < n) {
    throw new Error("expected at least " + n + " argument(s), got " + m);
  }
}

function aArray(x) {
  argN(1, arguments.length);
  if (Array.isArray(x)) {
    return x;
  }
  throw new Error("not an array: " + x);
}

function aArray1(x) {
  argN(1, arguments.length);
  if (Array.isArray(x) && x.length >= 1) {
    return x;
  }
  throw new Error("not a nonempty array: " + x);
}

function aFunc(x) {
  argN(1, arguments.length);
  if (typeof x === "function") {
    return x;
  }
  throw new Error("not a function: " + x);
}

function aString(x) {
  argN(1, arguments.length);
  if (typeof x === "string") {
    return x;
  }
  throw new Error("not a string: " + x);
}

function aObject(x) {
  argN(1, arguments.length);
  if (typeof x === "object" && x) {
    return x;
  }
  throw new Error("not an object: " + x);
}

function aBoolean(x) {
  argN(1, arguments.length);
  if (typeof x === "boolean") {
    return x;
  }
  throw new Error("not a boolean: " + x);
}

function aNumber(x) {
  argN(1, arguments.length);
  if (typeof x === "number") {
    return x;
  }
  throw new Error("not a number: " + x);
}

function aInteger(x) {
  argN(1, arguments.length);
  if (typeof x === "number" && x % 1 === 0) {
    return x;
  }
  throw new Error("not an integer: " + x);
}

function freeze(x) {
  argN(1, arguments.length);
  return Object.freeze(x);
}

function add(a, b) {
  argN(2, arguments.length);
  return aNumber(a) + aNumber(b);
}

function array() {
  argNPlus(1);
  var a = Array.prototype.slice.call(arguments, 1);
  if (arguments[0]) {
    Object.freeze(a);
  }
  return a;
}

function concat(a, b) {
  argN(2, arguments.length);
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.concat(b);
  }
  throw new Error("incorrect argument types for ++");
}

function strcat(a, b) {
  argN(2, arguments.length);
  if (isValueType(a) && isValueType(b)) {
    return "" + a + b;
  }
  throw new Error("incorrect argument types for ..");
}

function divide(a, b) {
  argN(2, arguments.length);
  return aNumber(a) / aNumber(b);
}

function eq(a, b) {
  argN(2, arguments.length);
  if (isValueType(a) && isValueType(b)) {
    return a === b;
  } else {
    throw new Error(
      "cannot check equality of reference types, " +
      "use operator 'is' instead"
    );
  }
}

function isValueType(a) {
  argN(1, arguments.length);
  return (
    a === undefined ||
    a === null ||
    typeof a === "boolean" ||
    typeof a === "string" ||
    typeof a === "number"
  );
}

function idx(array, index) {
  argN(2, arguments.length);
  if (!Array.isArray(array)) {
    throw new Error("cannot numerically index non-array: " + array);
  }
  if (typeof index === "number" && index % 1 === 0) {
    var n = array.length;
    if (-n <= index && index < n) {
      return true;
    }
    throw new Error("index out of range: " + index);
  }
  throw new Error("index is not an integer: " + index);
}

function arrayGet(array, index) {
  argN(2, arguments.length);
  idx(array, index);
  var n = array.length;
  return array[(index + n) % n];
}

function objectGet(obj, key) {
  argN(2, arguments.length);
  if (has(obj, key)) {
    return obj[key];
  }
  throw new Error(obj + " does not have key " + key);
}

function gt(a, b) {
  argN(2, arguments.length);
  return aNumber(a) > aNumber(b);
}

function gte(a, b) {
  argN(2, arguments.length);
  return gt(a, b) || eq(a, b);
}

function has(obj, key) {
  argN(2, arguments.length);
  if (obj === null || obj === undefined) {
    throw new Error(obj + " cannot have keys");
  }
  if (typeof key === "string") {
    return obj[key] !== undefined;
  }
  throw new Error("Key must be a string" +
    ", got " + typeof key);
}

function is(x, y) {
  argN(2, arguments.length);
  if (x === y) {
    return x !== 0 || 1 / x === 1 / y;
  } else {
    return x !== x && y !== y;
  }
}

function lt(a, b) {
  argN(2, arguments.length);
  return aNumber(a) < aNumber(b);
}

function lte(a, b) {
  argN(2, arguments.length);
  return lt(a, b) || eq(a, b);
}

function multiply(a, b) {
  argN(2, arguments.length);
  return aNumber(a) * aNumber(b);
}

function negate(x) {
  argN(2, arguments.length);
  return -aNumber(x);
}

function neq(a, b) {
  argN(2, arguments.length);
  return !eq(a, b);
}

function not(x) {
  argN(1, arguments.length);
  return !aBoolean(x);
}

function aNumber(x) {
  argN(1, arguments.length);
  if (typeof x !== "number") {
    throw new Error("not a number: " + x);
  }
  return x;
}

function object() {
  argNPlus(1);
  if (arguments.length % 2 !== 1) {
    throw new Error("objects must have an even number of items");
  }
  var obj = {};
  var i = 1;
  var n = arguments.length - 1;
  while (i < n) {
    if (typeof arguments[i] !== "string") {
      throw new Error("object keys must be strings: " + arguments[i]);
    }
    obj[arguments[i]] = arguments[i + 1];
    i += 2;
  }
  if (arguments[0]) {
    Object.freeze(obj);
  }
  return obj;
}

function slice(xs, i) {
  argN(2, arguments.length);
  return Object.freeze(Array.prototype.slice.call(xs, i));
}

function subtract(a, b) {
  argN(2, arguments.length);
  return aNumber(a) - aNumber(b);
}

function internalName(a) {
  argN(1, arguments.length);
  return Object.prototype.toString.call(a).slice(8, -1);
}

function type(x) {
  argN(1, arguments.length);
  if (x === null) {
    return "null";
  }
  if (Array.isArray(x)) {
    return "array";
  }
  if (internalName(x) === "RegExp") {
    return "regexp";
  }
  return typeof x;
}

function update(a, b) {
  argN(2, arguments.length);
  var c = Object.create(Object.getPrototypeOf(a));
  Object.keys(a).forEach(function(k) {c[k] = a[k]; });
  Object.keys(b).forEach(function(k) {c[k] = b[k]; });
  return Object.freeze(c);
}

exports.aArray = aArray;
exports.aArray1 = aArray1;
exports.aBoolean = aBoolean;
exports.add = add;
exports.aFunc = aFunc;
exports.aInteger = aInteger;
exports.aNumber = aNumber;
exports.aObject = aObject;
exports.argN = argN;
exports.argNPlus = argNPlus;
exports.array = array;
exports.arrayGet = arrayGet;
exports.aString = aString;
exports.concat = concat;
exports.divide = divide;
exports.eq = eq;
exports.freeze = freeze;
exports.gt = gt;
exports.gte = gte;
exports.has = has;
exports.idx = idx;
exports.internalName = internalName;
exports.is = is;
exports.isValueType = isValueType;
exports.lt = lt;
exports.lte = lte;
exports.multiply = multiply;
exports.negate = negate;
exports.neq = neq;
exports.not = not;
exports.object = object;
exports.objectGet = objectGet;
exports.slice = slice;
exports.strcat = strcat;
exports.subtract = subtract;
exports.type = type;
exports.update = update;
