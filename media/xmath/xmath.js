(function () {
    'use strict';

    var xMath = window.xMath = {};

    xMath.lcm = function (/* ... */) {
        var arr = arguments;
        var a = arr[0];
        for (var i = 1; i < arr.length; i++) {
            a = a * arr[i] / this.gcd(a, arr[i]);
        }
        return a;
    };

    xMath.gcd = function (/* ... */) {
        var arr = arguments;
        var a = arr[0];
        for (var i = 1; i < arr.length; i++) {
            var b = arr[i];
            while (a && b) {
                if (a > b) {
                    a %= b;
                } else {
                    b %= a;
                }
            }
            a += b;
        }
        return a;
    };

    xMath.sum = function (/* ... */) {
        var arr = arguments;
        var a = arr[0];
        for (var i = 1; i < arr.length; i++) {
            a += arr[i];
        }
        return a;
    };

    xMath.range = function (first, last) {
        var size = last - first + 1;
        var arr = new Array(size);
        for (var i = 0; i < size; i++) {
            arr[i] = i + first;
        }
        return arr;
    };

    xMath.getRangeByLcm = function(first, result) {
        var last;
        for (last = first; result % last === 0; last++) {}
        return last - 1;
    };
})();
