var Test = require("./test");

var describe = Test.describe;
var it = Test.it;
var eq = Test.eq;

var rt = require("../rt");

describe("rt.Array", function() {
  describe("first()", function() {
    it("should return the first item");
  });

  describe("rest()", function() {
    it("should return all items after the first one");
    it("should return a frozen array");
  });

  describe("last()", function() {
    it("should return the last item");
  });

  describe("slice()", function() {
    it("should return all items between the two indices, inclusively");
    it("should return a frozen array");
  });

  describe("enumerate()", function() {
    it("should return an array of pairs of indices and items");
  });

  describe("all()", function() {
    it("should return true if all items pass the predicate");
    it("should return false if at least one item fails the predicate");
    it("should not check more items than necessary");
  });

  describe("any()", function() {
    it("should return true if at least one item passes the predicate");
    it("should return false if at least one item fails the predicate");
    it("should not check more items than necessary");
  });

  describe("foldLeft()", function() {
    it("should return the initial value for empty arrays");
    it("should call callback(accumulator, item) for each item " +
      "from left-to-right");
    it("should only pass two arguments to the callback");
  });

  describe("foldRight()", function() {
    it("should return the initial value for empty arrays");
    it("should call callback(accumulator, item) for each item" +
      "from right-to-left");
    it("should only pass two arguments to the callback");
  });

  describe("reduce()", function() {
    it("should error on empty arrays");
    it("should call callback(accumulator, item) for each item" +
      "from left-to-right");
    it("should only pass two arguments to the callback");
  });

  describe("map()", function() {
    it("should return an empty array given an empty array");
    it("should call callback(item) for each item from left-to-right");
    it("should only pass one argument to the callback");
    it("should return a frozen array");
  });

  describe("mapN()", function() {
    it("should do stuff?");
    it("should return a frozen array");
  });

  describe("flatten()", function() {
    it("should turn an array of arrays into just an array");
    it("should error if any item is a non-array");
    it("should return a frozen array");
  });

  describe("flatMap()", function() {
    it("should be equivalent to calling map() then flatten()");
  });

  describe("filter()", function() {
    it("should keep all items where the predicate returns true");
    it("should throw if the predicate returns a non-boolean");
    it("should return a frozen array");
  });

  describe("forEach()", function() {
    it("should call callback(item) for each item from left-to-right");
    it("should return undefined");
  });

  describe("zip()", function() {
    it("should join two arrays into an array of pairs");
    it("should error on arrays of differing sizes");
    it("should return a frozen array");
  });

  describe("contains()", function() {
    it("TODO");
  });

  describe("sortWith()", function() {
    it("TODO");
  });

  describe("fromArrayLike()", function() {
    it("should convert an array-like to a frozen array");
  });

  describe("of()", function() {
    it("should take the entire arguments and return a frozen array");
  });

  describe("copy()", function() {
    it("should return a frozen copy of an array");
  });

  describe("get()", function() {
    it("should return the item by index if it's within bounds", function() {
      var xs = ["a", "b", "c"];
      eq(rt.Array.get(xs, 0, null), "a");
      eq(rt.Array.get(xs, 1, null), "b");
      eq(rt.Array.get(xs, 2, null), "c");
    });
    it("should support negative indices", function() {
      var xs = ["a", "b", "c"];
      eq(rt.Array.get(xs, -3, null), "a");
      eq(rt.Array.get(xs, -2, null), "b");
      eq(rt.Array.get(xs, -1, null), "c");
    });
    it("should return the fallback value if out of bounds", function() {
      eq(rt.Array.get([], 0, 3), 3);
      eq(rt.Array.get([], -1, 4), 4);
      eq(rt.Array.get([1], -2, 4), 4);
    });
  });
});
