var findLast = require('lodash/collection/findLast');

// TODO: Make some of these methods pseudo-private with underscores or something
// to keep the intended outside API clear.

// OverlayMap is essentially a class for managing variable scopes. It allows
// nesting. Nested OverlayMaps are used to track nested scopes. The method
// setBest is used to set the value for the method setBest sets the key for the
// lowest scope which contains the key already, falling back to the current
// scope if the key is not found. This allows me to keep track of when variables
// are being used.
function OverlayMap(parent) {
    var map = Object.create(null);
    var api = {};
    api.setHere = function(k, v) {
        if (typeof k !== 'string') {
            throw new Error('OverlayMap keys must be strings: ' + k);
        }
        map[k] = v;
        return api;
    };
    api.setBest = function(k, v) {
        return api.bestAncestorFor(k).setHere(k, v);
    };
    api.ancestors = function() {
        if (parent) {
            return parent.ancestors().concat([parent]);
        }
        return [];
    };
    api.bestAncestorFor = function(k) {
        var has = function(m) { return m.hasOwnKey(k); };
        return findLast(api.ancestors(), has) || api;
    };
    api.get = function(k) {
        if (k in map) {
            return map[k];
        }
        if (parent) {
            return parent.get(k);
        }
        throw new Error('no such key ' + k + ' in OverlayMap');
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
            return ks.concat(parent.keys());
        }
        return ks;
    };
    api.bareToString = function() {
        var innards = Object
            .keys(map)
            .map(function(k) {
                return k + ": " + map[k];
            })
            .join(", ");
        var s = "{" + innards + "}";
        if (parent) {
            return parent.bareToString() + " => " + s;
        }
        return s;
    };
    api.toString = function() {
        return "OverlayMap[" + api.bareToString() + "]";
    };
    api.parent = parent;
    return Object.freeze(api);
}

module.exports = OverlayMap;
