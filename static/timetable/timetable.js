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

    Timetable.prototype.clear = function () {
        this.data = {};
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
//      visualization control
// =================================

    /**
     * show/hide timetable
     * @param {bool} state   true - show, false - hide
     */
    Timetable.prototype.show = function (state) {
        var _state = Boolean(state);
        if (!this.base || this.showState === _state) {
            return;
        }
        this.showState = _state;
        if (state) {
            this.base.show();
        } else {
            this.base.hide();
        }
    };

    Timetable.prototype.clearScreen = function () {
        this.base.find('.timetable').html('');
    };



// =================================
//          time management
// =================================

    var gatherTimes = function (lessons) {
        if (!Array.isArray(lessons)) {
            return;
        }
        var times = [];
        lessons.forEach(function (lesson) {
            times.push(lesson.timeslot);
        });
        return dataHelper.uniqueSort(times, function (a, b) {
            return a.beg - b.beg;
        });
    };




// =================================
//          layout/arrangement
// =================================

    Timetable.prototype.getCellIndex = function (col, row) {
        var cols = this.workspace.cols;
        return (row * cols) + col;
    };

    Timetable.prototype.initArrangeCell = function (lesson) {
        var day = lesson.timeslot.day;
        var time = lesson.begNum;
        return {
            lessons: [],
            base: this.workspace.cells[day][time]
        };
    };

    // todo: table cells union
    Timetable.prototype.arrangeLessons = function () {
        // todo: error handling
        // todo: teacher\group render specific
        var self = this;
        var res = [];

        this.data.lessons.forEach(function (lesson) {
            if (lesson === undefined) {
                return;
            }
            var day = lesson.timeslot.day;
            var resNum = self.getCellIndex(lesson.begNum, day);

            res[resNum] = res[resNum] || self.initArrangeCell(lesson);
            res[resNum].lessons.push(lesson);
        });

        return res;
    };



// =================================
//          lessons
// =================================

    var splitMap = {
        full: 0,
        upper: 0,
        lower: 1
    };

    var getMetrics = function (cell) {
        var isSplit = false;
        var fullExist = false;
        var isSame = true;
        var sgCnt = cell.lessons[0].subcount;

        cell.lessons.forEach(function (lesson) {
            var split = lesson.timeslot.split;
            isSplit |= (split !== 'full');
            fullExist |= (split === 'full');
            isSame &= (sgCnt === lesson.subcount);
        });
        return {
            same: isSame, // all lessons have same subgroup count
            full: fullExist, // splitted lesson existence
            split: isSplit, // fulltime lesson existence
            count: sgCnt // subgroup count from random lesson. Use if same is true!
        };
    };

    Timetable.prototype.gatherFullSubgroups = function (cell) {
        var self = this;
        var sgs = [];

        cell.lessons.forEach(function (lesson) {
            var lessonID = lesson.id;
            if (lesson.timeslot.split !== 'full') {
                return;
            }
            self.data.curricula[lessonID].forEach(function (curriculum) {
                sgs.push(curriculum.subnum - 1);
            });
        });
        return sgs;
    };

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

    Timetable.prototype.fillLesson = function (lesson, cells) {
        var self = this;
        var lessonID = lesson.id;

        this.data.curricula[lessonID].forEach(function (curriculum) {
            var curriculumNum = curriculum.subnum - 1;
            self.gen.fillCell(curriculum, cells[curriculumNum]);
        });
    };


    Timetable.prototype.fillCellAdvanced = function (cell) {
        var self = this;
        var metric = cell.metric;
        var rows = (metric.split) ? 2 : 1;
        var cols = cell.lessons[0].subcount;
        var sgs = this.gatherFullSubgroups(cell);
        var base = this.gen.createTable(rows, cols, cell.base, sgs);

        cell.lessons.forEach(function (lesson) {
            self.gen.setLesson(lesson);
            var splitNum = splitMap[lesson.timeslot.split];
            self.fillLesson(lesson, base[splitNum]);
        });
    };

    Timetable.prototype.fillCell = function (cell) {
        var self = this;
        var hors = (cell.metric.split) ? this.gen.splitHorizontal(cell.base) : [cell.base];

        cell.lessons.forEach(function (lesson) {
            self.gen.setLesson(lesson);
            var splitIndex = splitMap[lesson.timeslot.split];
            var base = hors[splitIndex];
            var cells = (+lesson.subcount === 1)
                ? [base]
                : self.gen.getVertical(lesson.subcount, base);

            self.fillLesson(lesson, cells);
        });
    };


// =================================
//          drawing
// =================================

    /**
     * fill timetable info bars (time, days, etc)
     * @param {jQuery[]} bar
     * @param {string[]} data
     */
    var fillBar = function (bar, data) {
        if (Array.isArray(data) && Array.isArray(bar)) {
            var length = Math.min(bar.length, data.length);
            var i;
            for (i = 0; i < length; ++i) {
                bar[i].html(data[i]);
            }
        }
    };


    Timetable.prototype.drawMeta = function () {
        var data = this.data;
        var workspace = this.workspace;

        // todo: use map
        fillBar(workspace.side, data.times);
        if (data.type === 'group' || data.type === 'teacher') {
            fillBar(workspace.top, data.days);
        }

        // todo: debug data
        // var times = gatherTimes(data.lessons);
        // console.log('times', times);
    };


    Timetable.prototype.drawLessons = function () {
        var self = this;
        var arrangement = this.arrangeLessons();

        arrangement.forEach(function (cell) {
            var metric = cell.metric = getMetrics(cell);
            if (metric.split && !metric.same && metric.full) {
                console.log('alias!', cell.lessons);
                return;
            }

            if (metric.same && metric.count > 1 && metric.split) {
                self.fillCellAdvanced(cell);
            } else {
                self.fillCell(cell);
            }
        });
    };

    Timetable.prototype.draw = function () {
        this.show(false);
        this.clearScreen();
        this.prepareData();

        // todo: hardcoded table size
        this.workspace = this.gen.createWorkspace({
            base: this.base,
            rows: 6,
            cols: 6
        });

        this.drawLessons();
        this.drawMeta();
    };

}()); // !Timetable closure
