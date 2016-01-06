var Test = require("./test");
var OverlayMap = require("../src/overlay-map");

var describe = Test.describe;
var it = Test.it;
var eq = Test.eq;

describe("OverlayMap", function() {
    it("should have no keys when constructed with null", function() {
        var scope = OverlayMap(null);
        eq(scope.ownKeys(), []);
    });

    it("should set its own keys when there is no parent", function() {
        var scope = OverlayMap(null);
        scope.set("foo", 1);
        eq(scope.get("foo"), 1);
    });

    it("should get from its parent when it doesn't have a key", function() {
        var parent = OverlayMap(null);
        parent.set("foo", 1);
        parent.set("bar", 2);
        var scope = OverlayMap(parent);
        eq(scope.get("foo"), 1);
        eq(scope.get("bar"), 2);
    });

    it("should set own keys without touching its parent", function() {
        var parent = OverlayMap(null);
        parent.set("foo", 1);
        parent.set("bar", 2);
        var scope = OverlayMap(parent);
        scope.set("foo", 10);
        eq(scope.get("foo"), 10);
        eq(scope.get("bar"), 2);
    });

    it("should support .hasKey", function() {
        var parent = OverlayMap(null);
        parent.set("a", 1);
        var scope = OverlayMap(parent);
        scope.set("b", 2);
        eq(scope.hasKey("a"), true);
        eq(scope.hasKey("b"), true);
    });

    it("should support .hasOwnKey", function() {
        var parent = OverlayMap(null);
        parent.set("a", 1);
        var scope = OverlayMap(parent);
        scope.set("b", 2);
        eq(scope.hasOwnKey("a"), false);
        eq(scope.hasOwnKey("b"), true);
    });

    it("should support .ownKeys", function() {
        var parent = OverlayMap(null);
        parent.set("a", 1);
        var scope = OverlayMap(parent);
        scope.set("b", 2);
        eq(scope.ownKeys(), ["b"]);
    });

    it("should support .allKeys", function() {
        var parent = OverlayMap(null);
        parent.set("a", 1);
        var scope = OverlayMap(parent);
        scope.set("b", 2);
        eq(scope.allKeys().sort(), ["a", "b"]);
    });
});
