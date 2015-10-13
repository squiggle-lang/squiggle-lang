var P = require("parsimmon");

var _ = require("./parse/whitespace")(null);

function cons(x, xs) {
    if (arguments.length === 1) {
        return cons.bind(null, x);
    }
    return [x].concat(xs);
}

function wrap(left, middle, right) {
    return P.string(left)
        .then(_)
        .then(middle)
        .skip(_)
        .skip(P.string(right));
}

function join(separator, array) {
    if (arguments.length === 1) {
        return join.bind(null, separator);
    }
    return array.join(separator);
}

function spaced(par) {
    return _.then(par).skip(_);
}

function word(str) {
    return P.string(str).skip(_);
}

function spread(f) {
    return function(xs) {
        return f.apply(null, xs);
    };
}

function list0(sep, par) {
    return list1(sep, par).or(P.of([]));
}

function list1(sep, par) {
    var more = sep.then(par).many();
    return par.chain(function(r) {
        return more.map(function(rs) {
            return cons(r, rs);
        });
    });
}

module.exports = {
    cons: cons,
    wrap: wrap,
    spaced: spaced,
    word: word,
    spread: spread,
    list0: list0,
    list1: list1,
    join: join
};
