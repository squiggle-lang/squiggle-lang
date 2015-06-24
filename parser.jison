%lex
%x string
%x identifier
%%

[0-9]+ return "NUMBER";

")" return ")";
"(" return "(";
"{" return "{";
"}" return "}";
"[" return "[";
"]" return "]";
":" return ":";
"=" return "=";
"~" return "~";
"," return ",";
"." return ".";

"let"   return "LET";
"in"    return "IN";
"if"    return "IF";
"then"  return "THEN";
"else"  return "ELSE";

["]             this.begin("string");
<string>["]     this.popState();
<string>[^"]*   return "STRING";
// Fix broken Sublime syntax highlighting with this quote: "

[_a-zA-Z\*\+\-\/\<\>\?][_a-zA-Z\*\+\-\/\<\>\?0-9]* return "IDENTIFIER";

[#][^\n]*\n // comment
[\n ]+      // whitespace

<<EOF>> return "EOF";

/lex

%%
Program
    : Expr EOF { return yy.Root($1); }
    ;

Expr
    : Expr0
    ;

Bindings
    : Identifier "=" Expr              -> [[$1, $3]]
    | Bindings "," Identifier "=" Expr -> $$.concat([[$3, $5]])
    ;

Expr0
    : IF Expr1 THEN Expr1 ELSE Expr1 -> yy.If($2, $4, $6)
    | Expr1
    ;

Expr1
    : LET "(" Bindings ")" IN Expr2 -> yy.Let($3, $6)
    | Expr2
    ;

Expr2
    : "~" "(" Parameters ")" Expr -> yy.Function($3, $5)
    | "~" "(" ")" Expr            -> yy.Function([], $4)
    | Expr3
    ;

Expr3
    : Expr3 "." Identifier -> yy.GetProperty($1, $3)
    | Expr4;

Expr4
    : Expr4 "(" Items ")" -> yy.Call($1, $3)
    | Expr4 "(" ")"       -> yy.Call($1, [])
    | Expr5
    ;

Expr5
    : Number
    | String
    | List
    | Map
    | Identifier
    | "(" Expr ")" -> $2
    ;

Parameters
    : Parameters "," Identifier -> $$.concat([$3])
    | Identifier                -> [$1]
    ;

List
    : "[" Items "]" -> yy.List($2)
    | "[" "]"       -> yy.List([])
    ;

Items
    : Expr           -> [$1]
    | Items "," Expr -> $$.concat([$3])
    ;

Map
    : "{" Pairs "}" -> yy.Map($2)
    | "{" "}"       -> yy.Map([])
    ;


Pairs
    : Expr ":" Expr           -> [[$1, $3]]
    | Pairs "," Expr ":" Expr -> $$.concat([[$3, $5]])
    ;

Identifier
    : IDENTIFIER -> yy.Identifier($1)
    ;

Number
    : NUMBER -> yy.Number(+$1)
    ;

String
    : STRING -> yy.String($1)
    ;
