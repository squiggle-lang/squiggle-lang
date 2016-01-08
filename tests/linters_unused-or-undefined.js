var Test = require("./test");
var fileParse = require("../src/file-parse");
var unusedOrUndeclared = require("../src/linters/unused-or-undeclared");

var describe = Test.describe;
var it = Test.it;
var eq = Test.eq;

function warningsFor(code) {
    var res = fileParse(code);
    if (!res.status) {
        throw new Error("parse error for Squiggle code:\n" + code);
    }
    return unusedOrUndeclared(res.value);
}

describe("unusedOrUndeclared()", function() {
    it("should find unused variables in blocks", function() {
        var w = warningsFor(`
            do
                let foo = 1
                "never used foo"
            end
        `);
        eq(w.length, 1);
    });

    it("should find unused variables in modules", function() {
        var w = warningsFor(`
            let foo = 1
            "never used foo"
        `);
        eq(w.length, 1);
    });

    it("should find undeclared variables", function() {
        var w = warningsFor(`
            undeclaredVar
        `);
        eq(w.length, 1);
    });

    // This one seems weird, but it's so we can have mutually recursive
    // functions and such. The runtime catches errors with this.
    it("should allow variables to be referenced before init", function() {
        var w = warningsFor(`
            def inc(x) do
                x + y
            end
            let y = 1
            inc(4)
        `);
        eq(w.length, 0);
    });

    it("should allow mutual recursion", function() {
        var w = warningsFor(`
            def f(x) do g(x - 1); end
            def g(x) do f(x - 1); end
            f(3)
        `);
        eq(w.length, 0);
    });
});
