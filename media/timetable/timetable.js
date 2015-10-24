/**
 * @typedef {object} curriculum_t
 * @property {number} id
 * @property {number} lessonid
 * @property {number} subnum
 *
 * @property {number} roomid
 * @property {string} roomname
 *
 * @property {number} subjectid
 * @property {string} subjectname
 *
 * @property {number} teacherid
 * @property {string} teachername
 * @property {string} teacherdegree
 */

/**
 * @typedef {object} lesson_t
 * @property {number} id
 * @property {number} day
 * @property {number} subcount
 * @property {number} begNum
 */

/**
 * @typedef {object} schedule_t
 * @property {object[]} lessons
 * @property {object} curricula
 * @property {curriculum_t[]} curricula.*
 */

/**
 * @param {object}      data
 * @param {jQuery}      data.base
 * @param {Generator}   data.generator
 *
 * @constructor
 */

function Timetable(data) {
    'use strict';

    this.data = {};
    this.gen = data.generator || new Generator();
    this.base = $(data.base);
}


(function () {
    'use strict';

// =================================
//          data management
// =================================

    /**
     * @param {object} data
     */
    Timetable.prototype.set = function (data) {
        this.data = this.data || {};
        if (data) {
            dataHelper.append(data, this.data);
        }
    };

    var localeTime = function (beg) {
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
        return -1;
    };

    var prepareLessons = function (lessons) {
        if (!lessons) {
            throw new Error('Empty lessons!');
        }

        lessons.forEach(function (lesson) {
            lesson.timeslot = parseTimeslot(lesson.timeslot);
            lesson.begNum = localeTime(lesson.timeslot.beg);
        });
    };

    var setGroupName = function (group) {
        var name = group.gradenum + '.' + group.groupnum;
        if (group.name != 'NULL') {
            name += '(' + group.name + ')';
        }
        group.name = name;
    };

    var abbrName = function(name) {
        var n = name.split(' ');
        if ( n.length === 3 )
            return n[0] + ' ' + n[1][0] + '.' + n[2][0] + '.';
        else
            return name;
    };

    Timetable.prototype.prepareData = function () {
        var data = this.data;

        // todo: error handling
        prepareLessons(data.lessons);
        data.curricula = dataHelper.groupBy(data.curricula, 'lessonid');

        if (data.groups) {
            data.groups.forEach(setGroupName);
            data.groups = dataHelper.groupBy(data.groups, 'uberid');
        }

        this.checkLessons();
        this.gen.tune(this.data);
    };


// =================================
//          lessons
// =================================

    /** skip lessons with empty curricula list */
    Timetable.prototype.checkLessons = function () {
        var self = this;
        var lessons = this.data.lessons;

        lessons.forEach(function (lesson, i) {
            if (!self.data.curricula[lesson.id]) {
                console.log('empty lesson!', lesson);
                lessons[i] = undefined;
            }
        });
    };

    var generateWeek = function (week, lessons, subcount) {
        var countPadding = week.length;

        var weekLastId = countPadding + subcount - 1;
        if (!week[weekLastId]) {
            week[weekLastId] = null;
        }

        lessons.forEach(function (lesson) {
            var title = '<span class="subject"><abbr title="' + lesson.subjectname + '">' + lesson.subjectabbr + '</abbr></span>';
            var subCell = '<span class="teacher"><abbr title="' + lesson.teachername + '">' + abbrName(lesson.teachername) + '</abbr></span><span class="room">' + lesson.roomname + '</span>';

            week[countPadding + lesson.subnum - 1] = {
                title: title,
                contents: [ subCell ]
            }
        });
    }

    var syncWeeks = function (weeks) {
        var weekLastId = Math.max(weeks.upper.length, weeks.lower.length) - 1;
        if (!weeks.upper[weekLastId]) {
            weeks.upper[weekLastId] = null;
        }
        if (!weeks.lower[weekLastId]) {
            weeks.lower[weekLastId] = null;
        }
    }

    var mergeLessons = function (week) {
        for (var i = 0; i < week.length; i++) {
            while (week[i] && week[i + 1] && week[i].title === week[i + 1].title) {
                week[i].contents.push(week[i + 1].contents[0]);
                week.splice(i + 1, 1);
            }
        }
    }

    var mergeRooms = function (week) {
        week.forEach(function (group) {
            if (group) {
                var contents = group.contents;
                for (var i = 0; i < contents.length; i++) {
                    var $current = $(contents[i]);
                    var $next = $(contents[i + 1]);
                    while (contents[i + 1] && $current.first().html() === $next.first().html()) {
                        if ($current.last().html() !== $next.last().html()) {
                            $current.last().html($current.last().html() + ', ' + $next.last().html());
                            contents[i] = $current.get(0).outerHTML + $current.get(1).outerHTML;
                        }
                        contents.splice(i + 1, 1);
                        $next = $(contents[i + 1]);
                    }
                }
            }
        });
    }

    Timetable.prototype.draw = function () {
        this.prepareData();

        var self = this;
        var res = new Array(6);
        for (var i = 0; i < res.length; i++) {
            res[i] = new Array(6);
        }

        this.data.lessons.forEach(function (lesson) {
            if (!lesson) {
                return;
            }
            var i = localeTime(lesson.timeslot.beg);
            var j = lesson.timeslot.day;
            if (!res[i][j]) {
                res[i][j] = [];
            }
            res[i][j].push(lesson);
        });

        res.forEach(function (line) {
            line.forEach(function (cell, cellId) {
                var weeks = {
                    upper: [],
                    lower: [],
                    hasFull: false
                }

                var twoWeeks = false;
                cell.forEach(function(lesson) {
                    var split = lesson.timeslot.split;

                    switch (split) {
                        case "full":
                            generateWeek(weeks.upper, self.data.curricula[lesson.id], lesson.subcount);
                            generateWeek(weeks.lower, self.data.curricula[lesson.id], lesson.subcount);
                            weeks.hasFull = true;
                            break;
                        case "upper":
                            generateWeek(weeks.upper, self.data.curricula[lesson.id], lesson.subcount);
                            twoWeeks = true;
                            if (weeks.hasFull) {
                                syncWeeks(weeks);
                            }
                            break;
                        case "lower":
                            generateWeek(weeks.lower, self.data.curricula[lesson.id], lesson.subcount);
                            twoWeeks = true;
                            if (weeks.hasFull) {
                                syncWeeks(weeks);
                            }
                            break;
                    }
                });

                mergeLessons(weeks.upper);
                mergeLessons(weeks.lower);

                mergeRooms(weeks.upper);
                mergeRooms(weeks.lower);

                if (!weeks.upper.length) {
                    weeks.upper = null;
                }

                if (!weeks.lower.length) {
                    weeks.lower = null;
                }

                if (twoWeeks) {
                    cell = line[cellId] = [ weeks.upper, weeks.lower ];
                } else {
                    cell = line[cellId] = [ weeks.upper ];
                }
            });
        });

        new Table($('.timetable'), res, this.data.times, this.data.days);
    };

})();
