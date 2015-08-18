var host = window.document.location.protocol + '//' + window.document.location.hostname;

function is_object(obj) {
    return (typeof obj == "object");
}

var groupBy = function(arr, key) {
    var out = {};

    arr.forEach(function(elem) {
        var keyVal = elem[key];
        if (keyVal in out) {
            out[keyVal].push(elem);
        } else {
            out[keyVal] = [elem];
        }
    });
    return out;
};

var timeRegExp = /([0-9]+):([0-9]+)/;

var parseTime = function(str) {
    var raw = timeRegExp.exec(str);
    return (+raw[1])*60 + (+raw[2]);
};


var parseTimeslot = function(str) {
    var raw = str.replace(/[\(\)]/g, '').split(',');
    return {
        day: +raw[0],
        beg: parseTime(raw[1]),
        end: parseTime(raw[2]),
        split: raw[3]
    }
};

var localeTime = function(beg) {
    return beg/45;
};

var prepareData = function(data) {
    data.lessons.forEach(function(elem) {
        elem.timeslot = parseTimeslot(elem.timeslot);
        elem.begNum = localeTime(elem.timeslot.beg);
        elem.day = elem.timeslot.day;
    });
    data.lessons = groupBy(data.lessons, 'day');
    data.curricula = groupBy(data.curricula, 'lessonid');
};




// Visualization helpers

var invalidate = function( $list ) {
    $list.forEach(function(elem) {
        elem.attr('disabled', true).val('0');
    });
};

var typeVisualization = function(showList, type) {
    showList.all.forEach(function (elem) {
        elem.hide();
    });
    if (type in showList) {
        showList[type].forEach(function (elem) {
            elem.show().attr('disabled', true).val('0');
        });
        showList[type][0].removeAttr('disabled');
    }
};
