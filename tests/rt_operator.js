var Test = require("./test");

var describe = Test.describe;
var it = Test.it;
// var eq = Test.eq;

describe("rt.Operator", function() {
  describe("add()", function() {
    it("should throw unless it has exactly two arguments which are enumbers");
  });

  describe("and()", function() {
    it("should throw unless it has exactly two boolean arguments");
    it("should return the boolean and");
  });

  describe("arrayGet()", function() {
    it("TODO");
  });

  describe("concat()", function() {
    it("should throw unless it has exactly two array arguments");
    it("should return a frozen array");
  });

  describe("divide()", function() {
    it("TODO");
  });

  describe("eq()", function() {
    it("should throw unless it has exactly two arguments");
    it("should throw on arrays");
    it("should throw on objects");
    it("should return true if they are the same primitive value");
  });

  describe("gt()", function() {
    it("TODO");
  });

  describe("gte()", function() {
    it("should just combine gt() and eq() using or");
  });

  describe("has()", function() {
    it("TODO");
  });

  describe("is()", function() {
    it("should throw unless it has exactly two arguments");
  });

  describe("lt()", function() {
    it("TODO");
  });

  describe("lte()", function() {
    it("should just combine lt() and eq() using or");
  });

  describe("multiply()", function() {
    it("TODO");
  });

  describe("negate()", function() {
    it("should throw unless it has exactly one number argument");
    it("should return the numerical negation");
  });

  describe("neq()", function() {
    it("should throw unless it has exactly two arguments");
  });

  describe("not()", function() {
    it("should throw unless it has exactly one boolean argument");
    it("should return the boolean negation");
  });

  describe("objectGet()", function() {
    it("TODO");
  });

  describe("or()", function() {
    it("should throw unless it has exactly two boolean arguments");
    it("should return the boolean or");
  });

  describe("strcat()", function() {
    it("TODO");
  });

  describe("subtract()", function() {
    it("TODO");
  });

  describe("update()", function() {
    it("TODO");
  });
});
