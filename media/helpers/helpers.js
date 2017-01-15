(() => {
    'use strict';

    let helpers = window.helpers = {};

    helpers.getNameAbbr = name => {
        let [ lastName, firstName, secondName ] = name.split(' ');
        lastName = lastName ? `${lastName} ` : '';
        firstName = firstName ? `${firstName[0]}.` : '';
        secondName = secondName ? `${secondName[0]}.` : '';
        return `${lastName}${firstName}${secondName}`;
    };

    helpers.getGroupName = ({ gradenum, groupnum, num, name }, gradeNum) => {
        gradenum = gradenum || gradeNum;
        groupnum = groupnum || num;

        gradenum = gradenum ? `${gradenum}.` : '';
        name = name && name !== 'NULL' ? ` (${name})` : '';
        
        return `${gradenum}${groupnum}${name}`;
    };

    helpers.compare = (x, y) => {
        return JSON.stringify(x) === JSON.stringify(y);
    };

    helpers.array = {};

    helpers.array.groupBy = (array, key) => {
        let res = {};
        array.forEach(function (elem) {
            if (!elem) {
                return;
            }

            let keyVal = JSON.stringify(elem[key]);
            if (res[keyVal]) {
                res[keyVal].push(elem);
            } else {
                res[keyVal] = [ elem ];
            }
        });
        return res;
    };

    helpers.array.setLength = (array, length) => {
        array.splice(length, array.length);
        while (array.length < length) {
            array.push(null);
        }
        return array;
    };

    helpers.array.fill = (array, value) => {
        for (var i = 0, sz = array.length; i < sz; i++) {
            array[i] = value;
        }
        return array;
    };

    helpers.array.last = array => {
        if (array.length) {
            return array[array.length - 1];
        }
    };

    helpers.time = {};

    helpers.time.parse = time => {
        let [ full, hours, minutes ] = /([0-9]+):([0-9]+)/.exec(time);
        hours = Number(hours);
        minutes = Number(minutes);
        return { hours, minutes };
    };

    helpers.time.getStamp = time => {
        return time.hours * 60 + (time.minutes || 0);
    };

    helpers.time.getString = ({ hours, minutes }) => {
        if (!minutes) {
            return `${hours}:00`;
        }

        if (minutes < 10) {
            return `${hours}:0${minutes}`;
        }

        return `${hours}:${minutes}`;
    };
})();
