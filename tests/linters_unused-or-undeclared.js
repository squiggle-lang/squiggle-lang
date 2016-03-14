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

function assertNumWarnings(n, code) {
  var w = warningsFor(code);
  if (w.length !== n) {
    console.log();
    console.log(code);
    console.log();
    console.log('>>> Expected', n, 'warnings, but got:');
    console.log(w);
    console.log();
  }
  eq(w.length, n);
}

describe("unusedOrUndeclared()", function() {
  it("should find unused variables in modules", function() {
    assertNumWarnings(1, `
      let foo = 1
      "never used foo"
    `);
  });

  it("should find unused variables in blocks", function() {
    assertNumWarnings(1, `
      do
        let foo = 1
        "never used foo"
      end
    `);
  });

  it("should consider variables to be used if exported", function() {
    assertNumWarnings(0, `
      let x = 1
      export x
    `);
  });

  it("should find undeclared variables", function() {
    assertNumWarnings(1, `
      undeclaredVar
    `);
  });

  it("should not allow variables to be referenced before decl", function() {
    assertNumWarnings(2, `
      def inc(x) do
        x + y
      end
      let y = 1
      inc(4)
    `);
  });

  it("should allow 'declared' variables before real decl", function() {
    assertNumWarnings(0, `
      declare y
      def inc(x) do
        x + y
      end
      let y = 1
      inc(4)
    `);
  });

  it("should allow 'declared' variables for ambient vars", function() {
    assertNumWarnings(0, `
      declare __dirname
      declare console
      console.log(__dirname)
    `);
  });

  it("should disallow use before declaration", function() {
    assertNumWarnings(1, `
      declare console
      let x = y
      let y = 2
      console.log(x)
      console.log(y)
    `);
  });

  it("should allow mutual recursion with decl", function() {
    assertNumWarnings(0, `
      declare g

      def f(x) do
        g(x - 1)
      end

      def g(x) do
        f(x - 1)
      end

      f(3)
    `);
  });

  it("should not allow mutual recursion without decl", function() {
    assertNumWarnings(2, `
      def f(x) do
        g(x - 1)
      end

      def g(x) do
        f(x - 1)
      end

      f(3)
    `);
  });

  it("should allow match expressions", function() {
    assertNumWarnings(0, `
      match [1, 2]
      case [x, y] then
        x + y
      end
    `);
  });

  it("should allow match to shadow outer variables", function() {
    assertNumWarnings(8, `
      let x1 = 1
      let x2 = 2
      let x3 = 3
      let x4 = 4
      let x5 = 5
      let x6 = 6
      let x7 = 7
      let x8 = [8]
      match [1, 2]
      case [x1, x2] then
        x1 + x2
      case [x3, _, _] then
        x3
      case [x4, x5, x6, x7, ...x8] then
        x4 + x5 + x6 + x7 + x8.length
      end
    `);
  });
});
