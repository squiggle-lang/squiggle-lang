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

function indexedSequence(ctor, parser) {
    return P.seq(P.index, parser, P.index)
        .map(function(xs) {
            var index = {
                start: xs[0],
                end: xs[2]
            };
            var values = xs[1];
            return [index].concat(values);
        })
        .map(spread(ctor));
}

var iseq = indexedSequence;

function indexedSingle(ctor, parser) {
    return indexedSequence(ctor, P.seq(parser));
}

var ione = indexedSingle;

function indexedNothing(ctor, parser) {
    return indexedSequence(ctor, parser.result([]));
}

var inone = indexedNothing;

function combineIndices(index1, index2) {
    return {
        start: (index1 || index2).start,
        end: (index2 || index1).end
    };
}

var indc = combineIndices;

module.exports = {
    cons: cons,
    wrap: wrap,
    spaced: spaced,
    word: word,
    spread: spread,
    list0: list0,
    list1: list1,
    indexedSequence: indexedSequence,
    indexedSingle: indexedSingle,
    combineIndices: combineIndices,
    indexedNothing: indexedNothing,
    ione: ione,
    iseq: iseq,
    inone: inone,
    indc: indc,
    join: join
};
