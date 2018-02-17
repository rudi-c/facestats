"use strict";
exports.__esModule = true;
exports.fbEmailRegex = new RegExp("^([0-9]*)@facebook.com$");
function countMap(values) {
    var counts = new Map();
    values.forEach(function (value) {
        if (counts.has(value)) {
            counts.set(value, counts.get(value) + 1);
        }
        else {
            counts.set(value, 1);
        }
    });
    return counts;
}
exports.countMap = countMap;
function mapMap(map, f) {
    var newMap = new Map();
    Array.from(map.entries()).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        newMap.set(key, f(key, value));
    });
    return newMap;
}
exports.mapMap = mapMap;
function sum(values) {
    return values.reduce(function (a, b) { return a + b; });
}
exports.sum = sum;
function splitOnWhitespace(str) {
    return str.trim().split(/[ \t\n\r]+/);
}
exports.splitOnWhitespace = splitOnWhitespace;
