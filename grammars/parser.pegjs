{
    // Yikes... what a horrible import path.
    var ast = require("../../../src/ast");
}

Program "program"
    = _ "export" _ e:Expr _ { return ast.Module(e); }
    / _ e:Expr _            { return ast.Script(e); }

Expr "expression"
    = Expr0

Expr0 "if-expression"
    = "if" _ p:Expr1 "then" _ t:Expr0 "else" _ f:Expr0
    { return ast.If(p, t, f); }
    / Expr1

Expr1 "let-expression"
    = "let" _ "(" _ b:Bindings ")" _ "in" _ e:Expr
    { return ast.Let(b, e); }
    / Expr2

Bindings "variable bindings"
    = b:Binding bs:(("," _ b2:Binding) { return b2; })*
    { return [b].concat(bs); }

Binding "variable binding"
    = i:Identifier "=" _ e:Expr
    { return ast.Binding(i, e); }

Expr2 "infix-expression"
    = Expr2a

Expr2a "pipeline"
    = Expr3

Expr3 "property access"
    = e:Expr4 xs:(("." _ i:Identifier) { return i; })+
    { return xs.reduce(ast.GetProperty, e); }

Expr4 "method bind"
    = e:Expr5 xs:(("::" _ i:Identifier) { return i; })+
    { return xs.reduce(ast.GetMethod, e); }

Expr5 "method call"
    = e:Expr6 "." _ i:Identifier "(" _ xs:ListItems? ")" _
    { return ast.CallMethod(e, i, xs || []); }

Expr6 "function call"
    = e:Expr7 "(" _ xs:ListItems? ")" _
    { return ast.Call(e, xs || []); }

Expr7 "literal"
    = Number
    / String
    / True
    / False
    / Undefined
    / Null
    / List
    / Map
    / Function
    / IdentExpr
    / ParenExpr

IdentExpr "identifier-expression"
    = i:Identifier
    { return ast.IdentifierExpression(i); }

Function "function"
    = "~" _ m:Map? "(" _ p:Parameters? "|" _ e:Expr ")" _
    { return ast.Function(m || ast.Map([]), p || [], e); }

Parameters "parameters"
    = i:Identifier (("," _ i2: Identifier) { return i2; })*
    { return [i].concat(i2); }

ParenExpr "parenthesized-expression"
    = "(" _ e:Expr ")" _
    { return e; }

List "list"
    = "[" _ xs:ListItems "]" _
    { return xs; }

ListItems "list items"
    = e:Expr (("," _ e2:Expr) { return e2; })*
    { return [e].concat(e2); }

Map "map"
    = "{" _ xs:MapPairs "}" _
    { return ast.Map(xs); }

MapPairs "map pairs"
    = p:Pair (("," _ p2:Pair) { return p2; })*
    { return [p].concat(p2); }

Pair "map pair"
    = k:Expr ":" _ v:Expr
    { return ast.Pair(k, v); }

Identifier "identifier"
    = i:$([_a-zA-Z][_a-zA-Z0-9]*) _
    { return ast.Identifier(i); }

True "true"
    = "true" _
    { return ast.True(); }

False "false"
    = "false" _
    { return ast.False(); }

Undefined "undefined"
    = "undefined" _
    { return ast.Undefined(); }

Null "null"
    = "null" _
    { return ast.Null(); }

Number "number"
    = n:$([0-9]+) _
    { return ast.Number(+n); }

String "string"
    = '"' s:$([^"\n]+) '"' _
    { return ast.String(s); }

_  = [\ \t\n]*
WS = [\ \t]
NL = [\n]
