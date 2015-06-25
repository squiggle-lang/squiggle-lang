Program = _ e:Expression { return { type: "Root", expr: e } }

Newline "newline"
    = "\n"

Space "space"
    =  " "

Whitespace = Newline / Space
Anything = [^\n]*
Comment "comment"
    = "#" Anything Newline
WS = Whitespace / Comment

_ "whitespace" = WS*

// Expression "expression"
//     = BinExpr
//     / OtherExpr

Expression "expression"
    = OtherExpr

E = Expression

BinExpr
    = "<" _ "(" _ a:E b:E ")" _ { return {type: "Lt", a: a, b: b} }
    / ">" _ "(" _ a:E b:E ")" _ { return {type: "Gt", a: a, b: b} }
    / "*" _ "(" _ a:E b:E ")" _ { return {type: "Mul", a: a, b: b} }
    / "/" _ "(" _ a:E b:E ")" _ { return {type: "Div", a: a, b: b} }
    / "+" _ "(" _ a:E b:E ")" _ { return {type: "Add", a: a, b: b} }
    / "-" _ "(" _ a:E b:E ")" _ { return {type: "Sub", a: a, b: b} }

NoncallExpr = If / Let / Function / Literal / Identifier / ParenExpr
OtherExpr = Call / NoncallExpr

Argument "argument"
    = e:Expression _ { return e }

Call "function call"
    = f:E "(" _ args:Argument* ")" _ {
        return { type: "Call", f: f, args: args }
    }

ParenExpr "parenthesized expression"
    = "(" _ a:Expression ")" _ { return a }

If "if expression" =
    "if" _ p:Expression
    "then" _ t:Expression
    "else" _ f:Expression {
      return { type: "If", p: p, t: t, f: f }
    }

Param "parameter"
    = p:Identifier _ { return p }

Function "function" =
    "~" _ param:Identifier ":" _ body:Expression {
        return {
            type: "Function",
            parameters: [param],
            body: body
        }
    } /
    "~" _ "(" _ params:Param* ")" _ ":" _ body:Expression {
        return {
            type: "Function",
            parameters: params,
            body: body
        }
    }

Binding "variable binding"
    = i:Identifier "=" _ e:Expression
    { return [i, e] }

Let "let binding" =
    "let" _ "(" _
    bs:Binding+
    ")" _ "in" _ e:Expression {
        return { type: "Let", bindings: bs, expr: e }
    }

IdentChars0 = [_a-zA-Z\&\*\!\?\<\>\-\+\/]
IdentCharsN = $(IdentChars0 / [0-9])

Identifier "identifier"
    = s:$(IdentChars0 IdentCharsN*) _ {
        return { type: "Identifier", data: s }
    }

Literal = Number / String / Map / List

Item "list item" =
    item:Expression { return item }

List "list"
    = "[" _ items:Item* "]" _ {
        return { type: "List", data: items }
    }

Pair "map pair" =
    k:String _ v:Expression {
        return [k, v]
    }

Map "map"
    = "{" _ pairs:Pair* "}" _ {
        return { type: "Map", data: pairs }
    }

String "string"
    = '"' s:$([^"]*) '"' _ {
        return { type: "String", data: s }
    }

Number "number"
    = s:$([+-]?[0-9]+) _ {
      return { type: "Number", data: Number(s) }
    }
