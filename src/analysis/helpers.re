let fbEmailRegex = [%bs.raw {| new RegExp("^([0-9]*)@facebook.com$") |}];

let countMap = [%bs.raw {| (values) => {
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
} |}];

let mapMap = [%bs.raw {| (map, f) => {
    var newMap = new Map();
    Array.from(map.entries()).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        newMap.set(key, f(key, value));
    });
    return newMap;
} |}];

let sum = [%bs.raw {| (values) => {
    return values.reduce(function (a, b) { return a + b; });
} |}];

let splitOnWhitespace = [%bs.raw {| (str) => {
    return str.trim().split(/[ \t\n\r]+/);
} |}];