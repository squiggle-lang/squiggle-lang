function OverlayMap(parent) {
    var map = Object.create(null);
    var api = {};
    api.set = function(k, v) {
        if (typeof k !== 'string') {
            throw new Error('OverlayMap keys must be strings: ' + k);
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
        throw new Error('no such key ' + k + ' in OverlayMap');
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
