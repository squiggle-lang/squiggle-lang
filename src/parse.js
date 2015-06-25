var parser = require("../build/parser");
parser.parser.yy = require("./ast");
module.exports = parser.parse;
