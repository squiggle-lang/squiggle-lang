%lex
%x multi_string
%x string
%%

// TODO: Use @$ to get first_line and first_column numbers into the AST.

[0-9]+ return "NUMBER";

"::" return "::";
"++" return "++";
"|>" return "|>";
"<=" return "<=";
">=" return ">=";
"!=" return "!=";

")" return ")";
"(" return "(";
"{" return "{";
"}" return "}";
"[" return "[";
"]" return "]";
"|" return "|";
":" return ":";
";" return ";";
"=" return "=";
"~" return "~";
"," return ",";
"." return ".";
"<" return "<";
">" return ">";
"=" return "=";
"+" return "+";
"-" return "-";
"*" return "*";
"/" return "/";
"@" return "@";

"let"    return "LET";
"in"     return "IN";
"if"     return "IF";
"then"   return "THEN";
"else"   return "ELSE";
"and"    return "AND";
"or"     return "OR";
"export" return "EXPORT";

["]["]["]                 this.begin("multi_string");
<multi_string>["]["]["]   this.popState();
<multi_string>[^"]*       return "MULTI_STRING";
// Fix broken Sublime syntax highlighting with this quote: "

["]             this.begin("string");
<string>["]     this.popState();
<string>[^"\n]* return "STRING";
// Fix broken Sublime syntax highlighting with this quote: "

[_a-zA-Z][_a-zA-Z0-9]* return "IDENTIFIER";

[#][^\n]*\n // comment
[\n ]+      // whitespace

<<EOF>> return "EOF";

/lex

%left "|>"
%left "and" "or"
%left "<" ">" "="
%left "++"
%left "*" "/"
%left "+" "-"

%%
Program
    : Expr EOF        { return yy.Script($1); }
    | EXPORT Expr EOF { return yy.Module($2); }
    ;

Expr
    : Expr0
    ;

Bindings
    :              Identifier "=" Expr -> [yy.Binding($1, $3)]
    | Bindings "," Identifier "=" Expr -> $$.concat([yy.Binding($3, $5)])
    ;

Expr0
    : IF Expr1 THEN Expr0 ELSE Expr0 -> yy.If($2, $4, $6)
    | Expr1
    ;

Expr1
    : LET "(" Bindings ")" IN Expr -> yy.Let($3, $6)
    | Expr2
    ;

Expr2
    : Expr2 BinOp Expr3 -> yy.BinOp($2, $1, $3)
    | Expr3
    ;

Expr3
    : Expr3 "."  Identifier              -> yy.GetProperty($1, $3)
    | Expr3 "::" Identifier              -> yy.GetMethod($1, $3)
    | Expr3 "." Identifier "(" Items ")" -> yy.CallMethod($1, $3, $5)
    | Expr3 "." Identifier "("       ")" -> yy.CallMethod($1, $3, [])
    | Expr4
    ;

Expr4
    : Expr4 "(" Items ")" -> yy.Call($1, $3)
    | Expr4 "("       ")" -> yy.Call($1, [])
    | Expr5
    ;

BinOp
    : "+"  -> yy.Operator("+")
    | "-"  -> yy.Operator("-")
    | "*"  -> yy.Operator("*")
    | "/"  -> yy.Operator("/")
    | "<"  -> yy.Operator("<")
    | ">"  -> yy.Operator(">")
    | "="  -> yy.Operator("=")
    | AND  -> yy.Operator("and")
    | OR   -> yy.Operator("or")
    | ";"  -> yy.Operator(";")
    | "!=" -> yy.Operator("!=")
    | "<=" -> yy.Operator("<=")
    | ">=" -> yy.Operator(">=")
    | "|>" -> yy.Operator("|>")
    | "++" -> yy.Operator("++")
    ;

Expr5
    : Number
    | String
    | List
    | Map
    | Function
    | Identifier   -> yy.IdentifierExpression($1)
    | "(" Expr ")" -> $2
    ;

Function
    : "~" Map "(" Parameters "|" Expr ")" -> yy.Function($2, $4, $6)
    | "~" Map "("            "|" Expr ")" -> yy.Function($2, [], $5)
    | "~"     "(" Parameters "|" Expr ")" -> yy.Function(yy.Map([]), $3, $5)
    | "~"     "("            "|" Expr ")" -> yy.Function(yy.Map([]), [], $4)
    ;

Parameters
    : Parameters "," Identifier -> $$.concat([yy.Parameter($3)])
    |                Identifier -> [yy.Parameter($1)]
    ;

List
    : "[" Items "]" -> yy.List($2)
    | "["       "]" -> yy.List([])
    ;

Items
    :           Expr -> [$1]
    | Items "," Expr -> $$.concat([$3])
    ;

Map
    : "{" Pairs "}" -> yy.Map($2)
    | "{"       "}" -> yy.Map([])
    ;

Pairs
    :           Expr ":" Expr -> [yy.Pair($1, $3)]
    | Pairs "," Expr ":" Expr -> $$.concat([yy.Pair($3, $5)])
    ;

Identifier
    : IDENTIFIER -> yy.Identifier($1)
    ;

Number
    : NUMBER -> yy.Number(+$1)
    ;

String
    : STRING       -> yy.String($1)
    | MULTI_STRING -> yy.String($1)
    ;
