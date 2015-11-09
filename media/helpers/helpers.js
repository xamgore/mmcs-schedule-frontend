(function () {
    'use strict';

    var helpers = window.helpers = {};

    helpers.abbrName = function(name) {
        name = name.split(' ');
        if (name.length === 3) {
            return name[0] + ' ' + name[1][0] + '.' + name[2][0] + '.';
        } else {
            return name;
        }
    };

    helpers.compare = function (x, y) {
        return JSON.stringify(x) === JSON.stringify(y);
    };

    helpers.array = {};

    helpers.array.groupBy = function (array, key) {
        var out = {};
        array.forEach(function (elem) {
            if (!elem) {
                return;
            }

            var keyVal = JSON.stringify(elem[key]);
            if (out[keyVal]) {
                out[keyVal].push(elem);
            } else {
                out[keyVal] = [elem];
            }
        });
        return out;
    };

    helpers.array.setLength = function (array, length) {
        array.splice(length, array.length);
        while (array.length < length) {
            array.push(null);
        }
        return array;
    };

    helpers.array.fill = function (array, value) {
        for (var i = 0, sz = array.length; i < sz; i++) {
            array[i] = value;
        }
        return array;
    };

    helpers.array.last = function (array) {
        if (array.length) {
            return array[array.length - 1];
        }
    };

    helpers.time = {};

    helpers.time.parse = function (time) {
        time = /([0-9]+):([0-9]+)/.exec(time);

        return {
            hours: Number(time[1]),
            minutes: Number(time[2])
        };
    };

    helpers.time.getStamp = function (time) {
        return time.hours * 60 + (time.minutes || 0);
    };

    helpers.time.getString = function (time) {
        if (!time.minutes) {
            return String(time.hours) + ':00';
        }

        if (time.minutes < 10) {
            return String(time.hours) + ':0' + String(time.minutes);
        }

        return String(time.hours) + ':' + String(time.minutes);
    };
})();
