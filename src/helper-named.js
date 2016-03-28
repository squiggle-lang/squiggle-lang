var es = require("./es");

function helperNamed(name) {
  return es.MemberExpression(
    null,
    false,
    es.Identifier(null, "$$"),
    es.Identifier(null, name)
  );
}

module.exports = helperNamed;
