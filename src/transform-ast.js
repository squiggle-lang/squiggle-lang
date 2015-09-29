var isObject = require("lodash/lang/isObject");
var flatten = require("lodash/array/flatten");
var jsbeautify = require("js-beautify");
var esprima = require("esprima");

var PREDEF = require("./predef-ast");
var es = require("./es");
var ast = require("./ast");
var die = require("./die");
var fileWrapper = require("./file-wrapper");
var isJsReservedWord = require("./is-js-reserved-word");

function frozenArray(xs) {
    var fn = es.Identifier("$array");
    return es.CallExpression(fn, xs);
}

function transformAst(node) {
    if (!isObject(node)) {
        throw new Error("Not a node: " + jsonify(node));
    }
    if (handlers.hasOwnProperty(node.type)) {
        return handlers[node.type](node);
    }
    throw new Error("Unknown AST node: " + jsonify(node));
}

function unary(f) {
    return function(x) {
        return f(x);
    };
}

function mapLastSpecial(f, g, xs) {
    var n = xs.length;
    var ys = xs.slice(0, n - 1).map(unary(f));
    var y = unary(g)(xs[n - 1]);
    return ys.concat([y]);
}

function declareAssign(id, expr) {
    var init = es.VariableDeclarator(id, expr);
    return es.VariableDeclaration('var', [init]);
}

function freeze(esNode) {
    var id = is.Identifier("$freeze");
    return es.CallExpression(id, [esNode]);
}

function jsonify(x) {
    return JSON.stringify(x);
}

function literal(node) {
    return es.Literal(node.data);
}

function assertBoolean(x) {
    var id = ast.Identifier("$bool");
    var call = ast.Call(id, [x]);
    return transformAst(call);
}

function moduleExportsEq(x) {
    var moduleExports =
        es.MemberExpression(
            false,
            es.Identifier('module'),
            es.Identifier('exports')
        );
    return es.AssignmentExpression('=', moduleExports, x);
}

function globalComputedEq(name, x) {
    var literallyThis = es.Literal("this");
    var indirectEval = es.LogicalExpression("||",
        es.Literal(false),
        es.Identifier("eval")
    );
    var global = es.CallExpression(indirectEval, [literallyThis]);
    return es.ExpressionStatement(
        es.AssignmentExpression('=',
            es.MemberExpression(true,
                global,
                es.Literal(name)
            ),
            x
        )
    );
}

function throwHelper(esNode) {
    var throw_ = es.ThrowStatement(esNode);
    var body = [throw_];
    var fn = es.FunctionExpression(null, [], es.BlockStatement(body));
    return es.CallExpression(fn, []);
}

function isUnusedIdentifier(s) {
    return s.charAt(0) === "_";
}

function cleanIdentifier(s) {
    if (isJsReservedWord(s)) {
        return s + "_";
    }
    return s;
}

var handlers = {
    Module: function(node) {
        var value = transformAst(node.expr);
        var expr = moduleExportsEq(value);
        var body = PREDEF.body.concat([expr]);
        return fileWrapper(body);
    },
    Script: function(node) {
        var value = transformAst(node.expr);
        var body = PREDEF.body.concat([value]);
        return fileWrapper(body);
    },
    GetMethod: function(node) {
        var obj = node.obj;
        var prop = node.prop;
        return transformAst(
            ast.Call(
                ast.Identifier('$method'),
                [obj, prop]
            )
        );
    },
    CallMethod: function(node) {
        var obj = transformAst(node.obj);
        var prop = transformAst(node.prop);
        var method = es.MemberExpression(true, obj, prop);
        var args = node.args.map(transformAst);
        return es.CallExpression(method, args);
    },
    Not: function(node) {
        var expr = transformAst(node.expr);
        return es.CallExpression(es.Identifier("$not"), [expr]);
    },
    Negate: function(node) {
        var expr = transformAst(node.expr);
        return es.CallExpression(es.Identifier("$negate"), [expr]);
    },
    ReplBinding: function(node) {
        var name = node.binding.identifier.data;
        var expr = transformAst(node.binding.value);
        return fileWrapper([globalComputedEq(name, expr)]);
    },
    ReplExpression: function(node) {
        return fileWrapper([transformAst(node.expression)]);
    },
    Block: function(node) {
        var exprs = node
            .expressions
            .map(transformAst);
        var statements = mapLastSpecial(
            es.ExpressionStatement,
            es.ReturnStatement,
            exprs
        );
        var fn = es.FunctionExpression(null, [], es.BlockStatement(statements));
        return es.CallExpression(fn, []);
    },
    GetProperty: function(node) {
        var obj = node.obj;
        var prop = node.prop;
        return transformAst(
            ast.Call(
                ast.Identifier('$get'),
                [obj, prop]
            )
        );
    },
    BinOp: function(node) {
        var d = node.operator.data;
        if (d === 'and' || d === 'or') {
            var op = {and: '&&', or: '||'}[d];
            return es.LogicalExpression(op,
                assertBoolean(node.left),
                assertBoolean(node.right)
            );
        } else {
            var table = {
                "*": "multiply",
                "/": "divide",
                "+": "add",
                "-": "subtract",
                "++": "concat",
                "~": "update",
                ">=": "gte",
                "<=": "lte",
                "<": "lt",
                ">": "gt",
                "==": "eq",
                "!=": "neq"
            };
            var name = "$" + table[node.operator.data];
            var f = ast.Identifier(name);
            var args = [node.left, node.right];
            return transformAst(ast.Call(f, args));
        }
    },
    Identifier: function(node) {
        return es.Identifier(cleanIdentifier(node.data));
    },
    IdentifierExpression: function(node) {
        var id = transformAst(node.data);
        var name = es.Literal(node.data.data);
        var ref = es.Identifier("$ref");
        return es.CallExpression(ref, [id, name]);
    },
    Call: function(node) {
        var f = transformAst(node.f);
        var args = node.args.map(transformAst);
        return es.CallExpression(f, args);
    },
    Parameter: function(node) {
        return transformAst(node.identifier);
    },
    Function: function(node) {
        var name = node.name ?
            transformAst(node.name) :
            null;
        var positional = node.parameters.positional || [];
        var params = positional
            .map(function(x, i) {
                var n = i + 1;
                var name = x.identifier.data;
                if (name === "_") {
                    return "$" + n;
                } else if (name.charAt(0) === "_") {
                    return "$" + n + name.slice(0);
                } else {
                    return name;
                }
            })
            .map(function(name) { return ast.Identifier(name); })
            .map(transformAst);
        var n = params.length;
        var context = node.parameters.context;
        var bindContext = context ?
            [declareAssign(transformAst(context), es.ThisExpression())] :
            [];
        var slurpy = node.parameters.slurpy;
        var getSlurpy =
            es.CallExpression(
                es.Identifier("$slice"),
                [es.Identifier("arguments"), es.Literal(n)]
            );
        var bindSlurpy = slurpy ?
            [declareAssign(transformAst(slurpy), getSlurpy)] :
            [];
        var bodyExpr = transformAst(node.body);
        var returnExpr = es.ReturnStatement(bodyExpr);
        var op = slurpy ? "<" : "!==";
        var arityCheck = esprima.parse(
            "if (arguments.length " + op + " " + n + ") { " +
            "throw new $Error(" +
                "'expected " + n + " argument(s), " +
                "got ' + arguments.length" +
                "); " +
            "}"
        ).body;
        // Argument count will never be less than zero, so remove the
        // conditional entirely.
        if (n === 0 && slurpy) {
            arityCheck = [];
        }
        var body = flatten([
            arityCheck,
            bindContext,
            bindSlurpy,
            returnExpr
        ]);
        var innerFn = es.FunctionExpression(
            name,
            params,
            es.BlockStatement(body)
        );
        return innerFn;
        // React is a jerk and wants to mutate function objects a lot. Maybe one
        // day we can go back to freezing them, but until then, we'll play nice
        // with React.
        //
        // var callee = es.Identifier('$freeze');
        // var frozen = es.CallExpression(callee, [innerFn]);
        // return frozen;
    },
    If: function(node) {
        var p = assertBoolean(node.p);
        var t = transformAst(node.t);
        var f = transformAst(node.f);
        return es.ConditionalExpression(p, t, f);
    },
    Binding: function(node) {
        throw new Error("shouldn't be here");
    },
    Let: function(node) {
        var undef = es.Identifier("$undef");

        // Ensure there are no duplicate identifier names.
        var names = node.bindings.map(function(b) {
            return b.identifier.data;
        });
        var namesFound = Object.create(null);
        names.forEach(function(name) {
            if (name in namesFound) {
                die("squiggle: cannot rebind " + name);
            } else {
                namesFound[name] = true;
            }
        });

        // Initialize all variables to $undef so we can perform temporal
        // deadzone checking.
        var declarations = node.bindings
            .filter(function(b) {
                return !isUnusedIdentifier(b.identifier.data);
            })
            .map(function(b) {
                var id = transformAst(b.identifier);
                return es.VariableDeclaration('var', [
                    es.VariableDeclarator(id, undef)
                ]);
            });

        // Rebind variables to their correct values.
        var initializations = node.bindings.map(function(b) {
            var value = transformAst(b.value);
            if (isUnusedIdentifier(b.identifier.data)) {
                return es.ExpressionStatement(value);
            } else {
                var id = transformAst(b.identifier);
                var assign = es.AssignmentExpression('=', id, value);
                return es.ExpressionStatement(assign);
            }
        });

        var e = transformAst(node.expr);
        var returnExpr = es.ReturnStatement(e);
        var body = flatten([
            declarations,
            initializations,
            returnExpr
        ]);
        var block = es.BlockStatement(body);
        var fn = es.FunctionExpression(null, [], block);
        return es.CallExpression(fn, []);
    },
    Try: function(node) {
        var expr = transformAst(node.expr);
        var ok = frozenArray([
            es.Literal("ok"),
            expr,
        ]);
        var fail =  frozenArray([
            es.Literal("fail"),
            es.Identifier("$error")
        ]);
        var catch_ = es.CatchClause(
            es.Identifier("$error"),
            es.BlockStatement([
                es.ReturnStatement(fail)
            ])
        );
        var block = es.BlockStatement([
            es.ReturnStatement(ok)
        ]);
        var internalError = esprima.parse(
            "throw new $Error('squiggle: internal error');"
        ).body;
        var try_ = es.TryStatement(block, catch_);
        var body = [try_].concat(internalError);
        var fn = es.FunctionExpression(null, [], es.BlockStatement(body));
        return es.CallExpression(fn, []);
    },
    Error: function(node) {
        var message = transformAst(node.message);
        var exception = es.NewExpression(
            es.Identifier("$Error"),
            [message]
        );
        return throwHelper(exception);
    },
    Throw: function(node) {
        var exception = transformAst(node.exception);
        return throwHelper(exception);
    },
    Array: function(node) {
        var pairs = node.data.map(transformAst);
        var array = es.ArrayExpression(pairs);
        var callee = es.Identifier('$array');
        return es.CallExpression(callee, pairs);
    },
    Pair: function(node) {
        throw new Error("shouldn't be here");
    },
    Object: function(node) {
        var pairs = node
            .data
            .map(function(pair) {
                return [
                    transformAst(pair.key),
                    transformAst(pair.value)
                ];
            });
        return es.CallExpression(
            es.Identifier('$object'),
            flatten(pairs)
        );
    },
    Match: function(node) {
        var e = transformAst(node.expression);
        var body = node.clauses.map(transformAst);
        var matchError = esprima.parse(
            "throw new $Error('pattern match failure');"
        ).body;
        var block = es.BlockStatement(body.concat(matchError));
        var id = es.Identifier("$match");
        var fn = es.FunctionExpression(null, [id], block);
        return es.CallExpression(fn, [e]);
    },
    MatchClause: function(node) {
        var e = transformAst(node.expression);
        return match(node.pattern, e);
    },
    MatchPatternSimple: function(node) {
        throw new Error("you shouldn't be here");
    },
    MatchPatternArray: function(node) {
        throw new Error("you shouldn't be here");
    },
    MatchPatternObject: function(node) {
        throw new Error("you shouldn't be here");
    },
    MatchPatternObjectPair: function(node) {
        throw new Error("you shouldn't be here");
    },
    True: function(node) {
        return es.Literal(true);
    },
    False: function(node) {
        return es.Literal(false);
    },
    Null: function(node) {
        return es.Literal(null);
    },
    Undefined: function(node) {
        return es.Identifier('undefined');
    },
    Number: literal,
    String: literal,
};

/// I really want to modularize this code again, but it's mutually recursive
/// with transformAst...
///
/// BEGIN match function
function match(pattern, expression) {
    var id = es.Identifier("$match");
    var expr = wrapExpression(id, pattern, expression);
    var ret = es.ReturnStatement(expr);
    var pred = satisfiesPattern(id, pattern);
    var block = es.BlockStatement([ret]);
    return es.IfStatement(pred, block, null);
}

function esAnd(a, b) {
    return es.LogicalExpression("&&", a, b);
}

function esEq(a, b) {
    return es.BinaryExpression("===", a, b);
}

function esGe(a, b) {
    return es.BinaryExpression(">=", a, b);
}

function esIn(a, b) {
    return es.BinaryExpression("in", a, b);
}

function esSlice(xs, i) {
    var slice = es.Identifier("$slice");
    return es.CallExpression(slice, [i, xs]);
}

function esProp(obj, prop) {
    return es.MemberExpression(false, obj, es.Identifier(prop));
}

function esNth(a, i) {
    return es.MemberExpression(true, a, es.Literal(i));
}

function objGet(obj, k) {
    return es.MemberExpression(true, obj, es.Literal(k));
}

function esTypeof(x) {
    return {
        type: "UnaryExpression",
        prefix: true,
        operator: "typeof",
        argument: x,
    };
}

var j = JSON.stringify;

var esTrue = es.Literal(true);

function notEsTrue(x) {
    return !isEsTrue(x);
}

function isEsTrue(x) {
    return x.type === "Literal" && x.value === true;
}

var _satisfiesPattern = {
    MatchPatternSimple: function(root, p) {
        return esTrue;
    },
    MatchPatternLiteral: function(root, p) {
        var lit = es.Literal(p.data.data);
        return es.CallExpression(es.Identifier("$is"), [root, lit]);
    },
    MatchPatternParenExpr: function(root, p) {
        var expr = transformAst(p.expr);
        return es.CallExpression(es.Identifier("$eq"), [root, expr]);
    },
    MatchPatternArray: function(root, p) {
        var ps = p.patterns;
        var n = ps.length;
        var lengthEq = esEq(esProp(root, "length"), es.Literal(n));
        return ps
            .map(function(x, i) {
                return satisfiesPattern(esNth(root, i), x);
            })
            .filter(notEsTrue)
            .reduce(esAnd, esAnd(root, lengthEq));
    },
    MatchPatternArraySlurpy: function(root, p) {
        var ps = p.patterns;
        var n = es.Literal(ps.length);
        var atLeastLength = esGe(esProp(root, "length"), n);
        var a = ps
            .map(function(x, i) {
                return satisfiesPattern(esNth(root, i), x);
            })
            .filter(notEsTrue)
            .reduce(esAnd, esAnd(root, atLeastLength));
        var b = satisfiesPattern(esSlice(root, n), p.slurp);
        return esAnd(a, b);
    },
    MatchPatternObject: function(root, p) {
        var t = esTypeof(root);
        var o = es.Literal("object");
        var isObject = es.CallExpression(
            es.Identifier("$isObject"),
            [root]
        );
        return p
            .pairs
            .map(function(x) {
                return satisfiesPattern(root, x);
            })
            .filter(notEsTrue)
            .reduce(esAnd, isObject);
    },
    MatchPatternObjectPair: function(root, p) {
        // TODO: Don't assume the key is a string literal.
        var has = esIn(es.Literal(p.key.data), root);
        var rootObj = esNth(root, p.key.data);
        return esAnd(has, satisfiesPattern(rootObj, p.value));
    },
};

function satisfiesPattern(root, p) {
    if (p.type in _satisfiesPattern) {
        return _satisfiesPattern[p.type](root, p);
    }
    throw new Error("can't satisfiesPattern of " + j(p));
}

var __pluckPattern = {
    MatchPatternSimple: function(acc, root, p) {
        acc.identifiers.push(es.Identifier(p.identifier.data));
        acc.expressions.push(root);
        return acc;
    },
    MatchPatternLiteral: function(acc, root, p) {
        // Literals are just for the expression, they don't bind any values.
        return acc;
    },
    MatchPatternParenExpr: function(acc, root, p) {
        // We've already checked the values match, nothing to bind.
        return acc;
    },
    MatchPatternArray: function(acc, root, p) {
        p.patterns.forEach(function(x, i) {
            _pluckPattern(acc, esNth(root, i), x);
        });
        return acc;
    },
    MatchPatternArraySlurpy: function(acc, root, p) {
        p.patterns.forEach(function(x, i) {
            _pluckPattern(acc, esNth(root, i), x);
        });
        var n = es.Literal(p.patterns.length);
        _pluckPattern(acc, esSlice(root, n), p.slurp);
        return acc;
    },
    MatchPatternObject: function(acc, root, p) {
        p.pairs.forEach(function(v) {
            _pluckPattern(acc, root, v);
        });
        return acc;
    },
    MatchPatternObjectPair: function(acc, root, p) {
        // TODO: Don't assume p.key is a string literal.
        var objRoot = objGet(root, p.key.data);
        _pluckPattern(acc, objRoot, p.value);
        return acc;
    },
};

function _pluckPattern(acc, root, p) {
    if (p.type in __pluckPattern) {
        return __pluckPattern[p.type](acc, root, p);
    }
    throw new Error("can't pluckPattern of " + j(p));
}

function pluckPattern(root, p) {
    var obj = {identifiers: [], expressions: []};
    return _pluckPattern(obj, root, p);
}

function wrapExpression(root, p, e) {
    var obj = pluckPattern(root, p);
    var ret = es.ReturnStatement(e);
    var block = es.BlockStatement([ret]);
    var fn = es.FunctionExpression(null, obj.identifiers, block);
    return es.CallExpression(fn, obj.expressions);
}
/// END match function

module.exports = transformAst;
