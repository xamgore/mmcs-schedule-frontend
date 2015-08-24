$(function () {
    'use strict';
    $.schedule = {};
    $.schedule.state = {
        authorize: false
    };
    $.schedule.backendURL = window.document.location.protocol + '//' + window.document.location.hostname + ':3000/';
});

var is_object = Object.isObject; // replace


var groupBy = function (arr, key) {
    'use strict';
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

var localeTime = function (beg) {
    'use strict';
    // todo: Hindu hardcode!
    switch (beg) {
    case 8 * 60:
        return 0;
    case 9 * 60 + 50:
        return 1;
    case 11 * 60 + 55:
        return 2;
    case 13 * 60 + 45:
        return 3;
    case 15 * 60 + 50:
        return 4;
    case 17 * 60 + 40:
        return 5;
    }
    return 0;
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
