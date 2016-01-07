var assert = require("chai").assert;
var mocha = require("mocha");

exports.it = mocha.it;
exports.describe = mocha.describe;
exports.eq = assert.deepEqual;
exports.eq_ = assert.strictEqual;
