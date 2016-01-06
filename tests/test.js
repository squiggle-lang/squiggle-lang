var assert = require("assert");
var mocha = require("mocha");

exports.it = mocha.it;
exports.describe = mocha.describe;
exports.eq = assert.deepStrictEqual;
exports.eq_ = assert.strictEqual;
