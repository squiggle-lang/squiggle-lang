var flatten = require("lodash/array/flatten");

var traverse = require("../traverse");
var Scope = require("../scope");

function markAsUsed(messages, scope, node) {
  var name = node.data;
  var start = node.loc.start;
  if (scope.hasVar(name)) {
    scope.markAsUsed(name);
  } else {
    messages.push({
      line: start.line,
      column: start.column,
      data: "undeclared variable " + name
    });
  }
}

var enterTable = {
  Block: function(state, node, parent) {
    return Scope(state.scope);
  },
  AwaitExpr: function(state, node, parent) {
    var theScope = Scope(state.scope);
    var start = parent.binding.loc.start;
    theScope.declare(parent.binding.data, {
      line: start.line,
      column: start.column,
      used: false
    });
    return theScope;
  },
  Function: function(state, node, parent) {
    var theScope = Scope(state.scope);
    var params = node.parameters;
    flatten([
      params.context || [],
      params.positional,
      params.slurpy || []
    ]).forEach(function(b) {
      var start = b.identifier.loc.start;
      theScope.declare(b.identifier.data, {
        line: start.line,
        column: start.column,
        used: false
      });
    });
    return theScope;
  },
  MatchClause: function(state, node, parent) {
    return Scope(state.scope);
  },
  PatternSimple: function(state, node, parent) {
    var id = node.identifier.data;
    if (!state.scope.hasOwnVar(id)) {
      var start = node.identifier.loc.start;
      state.scope.declare(id, {
        line: start.line,
        column: start.column,
        used: false
      });
    }
    return state.scope;
  },
  Declaration: function(state, node, parent) {
    var start = node.identifier.loc.start;
    state.scope.declare(node.identifier.data, {
      line: start.line,
      column: start.column,
      used: false
    });
    return state.scope;
  },
  'IdentifierExpression Identifier': function(state, node, parent) {
    markAsUsed(state.messages, state.scope, node);
    return state.scope;
  }
};

function enter(state, node, parent) {
  var key = node.type;
  var key2 = (parent ? parent.type : '') + ' ' + key;
  if (enterTable.hasOwnProperty(key)) {
    state.scope = enterTable[key](state, node, parent);
  } else if (enterTable.hasOwnProperty(key2)) {
    state.scope = enterTable[key2](state, node, parent);
  }
}

function exit(state, node, parent) {
  var t = node.type;
  var ok = (
    t === 'Block' ||
    t === 'Module' ||
    t === 'Function' ||
    t === 'MatchClause' ||
    t === 'AwaitExpr'
  );
  if (t === 'Module') {
    node.exports.forEach(function(ident) {
      markAsUsed(state.messages, state.scope, ident);
    });
  }
  if (ok) {
    // Pop the scope stack and investigate for unused variables.
    state.scope.ownUnusedVars().forEach(function(id) {
      state.messages.push({
        line: id.line,
        column: id.column,
        data: "unused variable " + id.name
      });
    });
    state.scope = state.scope.parent;
  }
}

function unusedOrUndeclared(ast) {
  var state = {
    messages: [],
    scope: Scope(null)
  };
  var visitor = {
    enter: enter.bind(null, state),
    exit: exit.bind(null, state),
  };
  traverse.walk(visitor, ast);
  return state.messages;
}

module.exports = unusedOrUndeclared;
