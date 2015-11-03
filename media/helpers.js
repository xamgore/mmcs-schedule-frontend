$(function () {
    'use strict';
    $.schedule = {};
    $.schedule.state = {
        authorize: false
    };
    $.schedule.backendURL = window.document.location.protocol + '//' + window.document.location.hostname + ':3000/';
    $.schedule.backendURL = 'http://users.mmcs.sfedu.ru:3000/';
});



var dataHelper = {};

(function () {
    'use strict';

    /**
     * @param {object} src
     * @param {object} dst
     */
    dataHelper.append = function (src, dst) {
        $.each(src, function (key, val) {
            dst[key] = val;
        });
    };

    /**
     * @param {*[]} arr
     * @param {*}   key
     * @returns {object}
     */
    dataHelper.groupBy = function (arr, key) {
        var out = {};

        arr.forEach(function (elem) {
            var keyVal = elem[key];
            if (out[keyVal] !== undefined) {
                out[keyVal].push(elem);
            } else {
                out[keyVal] = [elem];
            }
        });
        return out;
    };

    dataHelper.groupUnique = function (arr, key) {
        var out = {};
        arr.forEach(function (elem) {
            var keyVal = elem[key];
            out[keyVal] = elem;
        });
    };


    dataHelper.uniqueSort = function(arr, comparator) {
        arr.sort(comparator);
        var ret = [arr[0]];
        for (var i = 1; i < arr.length; ++i) { // start loop at 1 as element 0 can never be a duplicate
            if ( comparator(arr[i-1], arr[i]) !== 0) {
                ret.push(arr[i]);
            }
        }
        return ret;
    };


    /**
     * Performs a binary search on the host array. This method can either be
     * injected into Array.prototype or called with a specified scope like this:
     * binaryIndexOf.call(someArray, searchElement);
     */
    var searchBinary = function (arr, elem, comp) {
        var minIndex = 0;
        var maxIndex = arr.length - 1;
        var currentIndex;
        var currentElement;
        var resultIndex;

        while (minIndex <= maxIndex) {
            resultIndex = currentIndex = (minIndex + maxIndex) / 2 | 0;
            currentElement = arr[currentIndex];

            var compResult = comp(currentElement, elem);

            if (compResult < 0) {
                minIndex = currentIndex + 1;
            } else if (compResult > 0) {
                maxIndex = currentIndex - 1;
            } else {
                return currentIndex;
            }
        }

        return ~maxIndex;
    };



}()); // ! dataHelper closure



var timeRegExp = /([0-9]+):([0-9]+)/;

var parseTime = function (str) {
    'use strict';
    var raw = timeRegExp.exec(str);
    return (+raw[1]) * 60 + (+raw[2]);
};


var parseTimeslot = function (str) {
    'use strict';
    var raw = str.replace(/[\(\)]/g, '').split(',');
    return {
        day: +raw[0],
        beg: parseTime(raw[1]),
        end: parseTime(raw[2]),
        split: raw[3]
    };
};



var prepareData = function (data) {
    'use strict';
    data.lessons.forEach(function (elem) {
        elem.timeslot = parseTimeslot(elem.timeslot);
        elem.begNum = localeTime(elem.timeslot.beg);
        elem.day = elem.timeslot.day;
    });
    data.curricula = groupBy(data.curricula, 'lessonid');
    if (!data.groups) {
        return;
    }
    data.groups.forEach(function (group) {
        var name = group.gradenum + '.' + group.groupnum;
        if (group.name != 'NULL') {
            name += '(' + group.name + ')';
        }
        group.name = name;
    });
    data.groups = groupBy(data.groups, 'uberid');
};


// Visualization helpers

var invalidate = function ($list) {
    'use strict';
    $list.forEach(function (elem) {
        elem.attr('disabled', true).val('0');
    });
};

var typeVisualization = function (showList, type) {
    'use strict';
    showList.all.forEach(function (elem) {
        elem.hide();
    });
    if (showList[type] !== undefined) {
        showList[type].forEach(function (elem) {
            elem.show().attr('disabled', true).val('0');
        });
        showList[type][0].removeAttr('disabled');
    }
};
