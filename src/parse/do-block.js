var P = require("parsimmon");

var _ = require("./whitespace")(null);
var H = require("../parse-helpers");

module.exports = function(ps) {
    var do_ = H.word("do");
    var end = P.string("end");
    return do_.then(ps.Block).skip(_).skip(end);
};
