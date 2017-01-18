(function () {
    'use strict';

    var xMath = window.xMath = {};

    xMath.sum = function (/* ... */) {
        var arr = arguments;
        var a = arr[0];
        for (var i = 1; i < arr.length; i++) {
            a += arr[i];
        }
        return a;
    };

    xMath.range = function (first, last) {
        var size = last - first;
        var arr = new Array(size);
        for (var i = 0; i < size; i++) {
            arr[i] = i + first;
        }
        return arr;
    };

    xMath.fact = function (x) {
        return x ? x * xMath.fact(x - 1) : 1;
    };
})();
