var Test = require("./test");

var describe = Test.describe;
var it = Test.it;
// var eq = Test.eq;

describe("rt.Object", function() {
  describe("map()", function() {
    it("should call callback(value) for each value");
    it("should return a frozen object");
  });

  describe("transform()", function() {
    it("should call callback(key, value) for each key-value pair");
    it("should return a frozen object");
  });

  describe("toPairs()", function() {
    it("should only include keys from Object.keys()");
    it("should return a frozen array of frozen pairs");
  });

  describe("fromPairs()", function() {
    it("should return a frozen object");
  });

  describe("copy()", function() {
    it("should only include keys from Object.keys()");
    it("should return a frozen object");
  });

  describe("get()", function() {
    it("should allow for customizable fallback on missing items");
  });
});
