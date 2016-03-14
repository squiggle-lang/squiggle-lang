var Test = require("./test");
var Scope = require("../src/scope");

var describe = Test.describe;
var it = Test.it;
var eq = Test.eq;

describe("Scope", function() {
  it("should have no keys when constructed with null", function() {
    var scope = Scope(null);
    eq(scope.ownVars(), []);
  });

  it("should set its own keys when there is no parent", function() {
    var scope = Scope(null);
    scope.declare("foo", {used: false});
    eq(scope.get("foo"), {used: false, name: "foo"});
  });

  it("should get from its parent when it doesn't have a key", function() {
    var parent = Scope(null);
    parent.declare("foo", {used: false});
    parent.declare("bar", {used: false});
    var scope = Scope(parent);
    eq(scope.get("foo"), {used: false, name: "foo"});
    eq(scope.get("bar"), {used: false, name: "bar"});
  });

  it("should set own keys without touching its parent", function() {
    var parent = Scope(null);
    parent.declare("foo", {used: false});
    parent.declare("bar", {used: false});
    var scope = Scope(parent);
    scope.declare("foo", {used: true});
    eq(scope.get("foo"), {used: true, name: "foo"});
    eq(scope.get("bar"), {used: false, name: "bar"});
  });

  it("should support .hasVar", function() {
    var parent = Scope(null);
    parent.declare("a", {used: false});
    var scope = Scope(parent);
    scope.declare("b", {used: false});
    eq(scope.hasVar("a"), true);
    eq(scope.hasVar("b"), true);
  });

  it("should support .hasOwnVar", function() {
    var parent = Scope(null);
    parent.declare("a", {used: false});
    var scope = Scope(parent);
    scope.declare("b", {used: false});
    eq(scope.hasOwnVar("a"), false);
    eq(scope.hasOwnVar("b"), true);
  });

  it("should support .ownVars", function() {
    var parent = Scope(null);
    parent.declare("a", {used: false});
    var scope = Scope(parent);
    scope.declare("b", {used: false});
    eq(scope.ownVars(), ["b"]);
  });

  it("should have a useful .toString", function() {
    var parent = Scope(null);
    parent.declare("a", {used: true});
    parent.declare("b", {used: false});
    var scope = Scope(parent);
    scope.declare("c", {used: false});
    eq(scope.toString(), "#Scope[{a:T b:F} > {c:F}]");
  });

  it("should support .ownUnusedVars", function() {
    var parent = Scope(null);
    parent.declare("a", {used: false});
    var scope = Scope(parent);
    scope.declare("b", {used: false});
    scope.declare("c", {used: true});
    scope.declare("d", {used: false});
    eq(scope.ownUnusedVars(), [
      {name: "b", used: false},
      {name: "d", used: false},
    ]);
  });

  it("should support .markAsUsed", function() {
    var parent = Scope(null);
    parent.declare("a", {used: false});
    parent.declare("z", {used: false});
    var scope = Scope(parent);
    scope.declare("a", {used: false});
    scope.declare("b", {used: false});
    scope.declare("c", {used: false});
    scope.declare("d", {used: false});
    scope.markAsUsed("a");
    scope.markAsUsed("c");
    eq(scope.get("a").used, true);
    eq(scope.get("z").used, false);
    eq(scope.get("b").used, false);
    eq(scope.get("c").used, true);
    eq(scope.get("d").used, false);
  });

  it("should support .declare and redeclaration copying .used", function() {
    var scope = Scope(null);
    scope.declare("a", {used: true});
    scope.declare("b", {});
    scope.declare("c", {});
    scope.declare("a", {});
    eq(scope.get("a"), {name: "a", used: true});
    eq(scope.get("b"), {name: "b"});
    eq(scope.get("c"), {name: "c"});
  });
});
