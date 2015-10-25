var xMath = (function () {
    var xMath = {
        lcm: function (/* ... */) {
            var arr = arguments;
            var a = arr[0];
            for (var i = 1; i < arr.length; i++) {
                var b = arr[i];
                a = (a * arr[i]) / this.gcd(a, arr[i]) ;
            };
            return a;
        },
        gcd: function (/* ... */) {
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
            };
            return a;
        },
        sum: function (/* ... */) {
            var arr = arguments;
            var a = arr[0];
            for (var i = 1; i < arr.length; i++) {
                a += arr[i];
            };
            return a;
        }
    }

    return xMath;
})();
