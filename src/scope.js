"use strict";

// TODO: Rename this to Scope.

// TODO: Make some of these methods pseudo-private with underscores or something
// to keep the intended outside API clear.

// Scope is essentially a class for managing variable scopes. It allows
// nesting. Nested Scopes are used to track nested scopes. It's like
// JavaScript's prototypal inheritance, but easier to follow what's happening.

function Scope(parent) {
    var map = Object.create(null);
    var api = {};
    api.markAsUsed = function(k) {
        if (typeof k !== "string") {
            throw new Error("Scope keys must be strings: " + k);
        }
        if (api.hasOwnVar(k)) {
            map[k].used = true;
            return api;
        }
        if (parent) {
            return parent.markAsUsed(k);
        }
        throw new Error("tried to use a variable before declaration: " + k);
    };
    api.ownUnusedVars = function() {
        return Object
            .keys(map)
            .filter(function(k) { return !map[k].used; })
            .map(function(k) { return map[k]; });
    };
    api.get = function(k) {
        if (api.hasOwnVar(k)) {
            return map[k];
        }
        if (parent) {
            return parent.get(k);
        }
        throw new Error("no such variable " + k);
    };
    api.declare = function(k, v) {
        // v.line :: number
        // v.column :: number
        // v.used :: boolean

        // Underscore is not a valid variable, so don't put it in the scope.
        if (k === "_") {
            return api;
        }
        v.name = k;
        // TODO: Unbreak the linter so I can use this check. Redeclaring a variable is not ok, but it's currently happening due to hoisting.
        // if (api.hasOwnVar(k)) {
        //     throw new Error("cannot redeclare variable " + k);
        // }
        if (api.hasOwnVar(k)) {
            v.used = api.get(k).used;
        }
        map[k] = v;
        return api;
    };
    api.hasVar = function(k) {
        if (api.hasOwnVar(k)) {
            return true;
        }
        if (parent) {
            return parent.hasVar(k);
        }
        return false;
    };
    api.hasOwnVar = function(k) {
        return {}.hasOwnProperty.call(map, k);
    };
    api.ownVars = function() {
        return Object.keys(map);
    };
    api.bareToString = function() {
        var innards = Object
            .keys(map)
            .map(function(k) {
                return k + ":" + (map[k].used ? "T" : "F");
            })
            .join(" ");
        var s = "{" + innards + "}";
        if (parent) {
            return parent.bareToString() + " > " + s;
        }
        return s;
    };
    api.toString = function() {
        return "#Scope[" + api.bareToString() + "]";
    };
    api.parent = parent;
    return Object.freeze(api);
}

module.exports = Scope;
