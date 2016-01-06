"use strict";

// TODO: Rename this to Scope.

// TODO: Make some of these methods pseudo-private with underscores or something
// to keep the intended outside API clear.

// OverlayMap is essentially a class for managing variable scopes. It allows
// nesting. Nested OverlayMaps are used to track nested scopes. It's like
// JavaScript's prototypal inheritance, but easier to follow what's happening.

function OverlayMap(parent) {
    var map = Object.create(null);
    var api = {};
    api.set = function(k, v) {
        if (typeof k !== "string") {
            throw new Error("OverlayMap keys must be strings: " + k);
        }
        map[k] = v;
        return api;
    };
    api.get = function(k) {
        if (k in map) {
            return map[k];
        }
        if (parent) {
            return parent.get(k);
        }
        throw new Error("no such key " + k + " in OverlayMap");
    };
    api.hasKey = function(k) {
        if (api.hasOwnKey(k)) {
            return true;
        }
        if (parent) {
            return parent.hasKey(k);
        }
        return false;
    };
    api.hasOwnKey = function(k) {
        return {}.hasOwnProperty.call(map, k);
    };
    api.ownKeys = function() {
        return Object.keys(map);
    };
    api.allKeys = function() {
        var ks = Object.keys(map);
        if (parent) {
            return ks.concat(parent.allKeys());
        }
        return ks;
    };
    api.bareToString = function() {
        var innards = Object
            .keys(map)
            .map(function(k) {
                return k + ": " + (map[k].used ? "T" : "F");
            })
            .join(", ");
        var s = "{" + innards + "}";
        if (parent) {
            return parent.bareToString() + " > " + s;
        }
        return s;
    };
    api.toString = function() {
        return "OM[" + api.bareToString() + "]";
    };
    api.parent = parent;
    return Object.freeze(api);
}

module.exports = OverlayMap;
