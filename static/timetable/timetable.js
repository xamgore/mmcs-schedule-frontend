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
 * @param {Generator}   generator
 * @param {object}      data
 * @param {jQuery}      data.base
 *
 * @constructor
 */
function Timetable(generator, data) {
    'use strict';

    this.tableBase = data.base;
    this.tableGen = generator;
    this.bars = {};
    this.created = false;
}

/**
 * clear workspace
 */
Timetable.prototype.erase = function () {
    'use strict';
    delete this.layout;
    delete this.schedule;
    this.created = false;

    if (this.table) {
        this.show(false);
        this.table.html('');
    }
};


/**
 * show/hide timetable/welcome page
 * @param {bool} state
 */
Timetable.prototype.show = function (state) {
    'use strict';
    if (!this.table) {
        return;
    }
    if (state) {
        $('.welcome_wrapper').hide();
        this.tableBase.show();
        $('.print_schedule').show(); // todo: what this??
    } else {
        this.tableBase.hide();
        $('.print_schedule').hide();
        $('.welcome_wrapper').show();
    }
};


Timetable.prototype.create = function () {
    'use strict';
    this.erase();
    this.created = true;

    var table = this.tableGen.getWorkspace(this.tableBase);
    this.cells = table.cells;
    this.table = table.table;
    this.bars = table.bars;
};


/**
 * fill timetable info bars (time, days, etc)
 * @param {string} type     possible types: 'side', 'top'
 * @param {string[]} data
 */
Timetable.prototype.fillBar = function (type, data) {
    'use strict';
    var bar = this.bars[type];
    if (Array.isArray(data) && Array.isArray(bar)) {
        var length = Math.min(bar.length, data.length);
        var i;
        for (i = 0; i < length; ++i) {
            bar[i].html(data[i]);
        }
    }
};



/**
 * @typedef {object[][]} metric_t
 * @property {number} [full]
 * @property {number} [upper]
 * @property {number} [lower]
 */
/**
 * @param {schedule_t} schedule
 * @returns {metric_t}
 */
Timetable.prototype.gatherMetrics = function (schedule) {
    'use strict';
    var metrics = [];
    if (schedule && Array.isArray(schedule.lessons)) {
        schedule.lessons.forEach(function (lesson) {
            var split = lesson.timeslot.split;
            var day = lesson.timeslot.day;
            var beg = lesson.begNum;

            var metricDay = metrics[day] = metrics[day] || [];
            var dst = metricDay[beg] = metricDay[beg] || {};

            dst[split] = Math.max(dst[split] || 0, lesson.subcount);
        });
    }
    return metrics;
};


/**
 * @typedef {object[][]} layout_t
 * @property {jQuery} [full]
 * @property {jQuery} [upper]
 * @property {jQuery} [lower]
 */
/**
 * @param {schedule_t} schedule
 * @returns {layout_t}
 */
Timetable.prototype.createLayout = function (schedule) {
    'use strict';
    var metrics = this.gatherMetrics(schedule);
    var layout = [];
    var self = this;

    metrics.forEach(function (day, dayNum) {
        var layDay = layout[dayNum] = [];
        day.forEach(function (metric, lesNum) {
            var $cell = self.cells[dayNum][lesNum];
            layDay[lesNum] = self.tableGen.fillLayoutCell(metric, $cell);
        });
    });
    return layout;
};

/**
 * @param {curriculum_t[]} curricula
 * @param {lesson_t} lesson
 * @param {jQuery} $lessonCell
 */
Timetable.prototype.createLesson = function (curricula, lesson, $lessonCell) {
    'use strict';
    var self = this;
    if (!Array.isArray(curricula) || !lesson || !$lessonCell) {
        return;
    }

    // todo: move to generator
    $lessonCell.addClass('uberCell');
    $lessonCell.attr('id', 'lesID_' + lesson.id);

    var table = (lesson.subcount > 1)
                    ? this.tableGen.getVertical(+lesson.subcount, $lessonCell)
                    : [ {$subjectCell: $lessonCell, $teacherCell: $lessonCell} ];

    $lessonCell.addClass('short_force');
    curricula.forEach(function (curriculum) {
        var sgNum = +curriculum.subnum - 1;
        self.tableGen.fillCell(curriculum, table[sgNum].$subjectCell, table[sgNum].$teacherCell);
    });
};

/**
 * @param {schedule_t} schedule
 * @param {object} bars
 * @param {*[]} bars.*
 */
Timetable.prototype.draw = function (schedule, bars) {
    'use strict';
    var self = this;
    this.create();
    this.layout = this.createLayout(schedule);
    this.schedule = schedule;

    // todo: delete debug info
    console.log(schedule);
    console.log(this.layout);


    $.each(bars, function (key, data) {
        self.fillBar(key, data);
    });
    var curricula = schedule.curricula;
    schedule.lessons.forEach(function (lesson) {
        var day = lesson.day;
        var beg = lesson.begNum;
        var split = lesson.timeslot.split;

        var curriculumSet = curricula[lesson.id]; // list of curricula for lesson
        var $cell = self.layout[day][beg][split]; // lesson DOM cell

        self.createLesson(curriculumSet, lesson, $cell);
    });

    this.show(true);
};

/**
 * @param {jQuery} $grouptable
 */
Timetable.prototype.optimizeSubgroupsTable = function ($grouptable) {
    'use strict';

    var $subject_row = $grouptable.find('tr.subgroups_subject');
    var $subjects = $subject_row.find('td');
    var cnt = $subjects.length;

    for (var i=0; i < cnt-1; ++i) {
        var $first = $($subjects[i]);
        var $second = $($subjects[i+1]);
        if ( $first.text() !== '' && $first.text() === $second.text() ) {
            var firstcolspan = +$first.attr('colspan');
            var secondcolspan = +$second.attr('colspan');
            var newcolspan = (isNaN(firstcolspan) ? 1 : firstcolspan) + (isNaN(secondcolspan) ? 1 : secondcolspan);
            $second.attr('colspan', newcolspan);
            $first.remove();
        }
    }

}

/**
 * @param {jQuery} $cell
 */
Timetable.prototype.optimizeCell = function ($cell) {
    'use strict';
    var height = $cell.height();
    var width = $cell.width();

    var sg = $cell.children('.table_subgroups');
    if ( sg.length ) {
        this.optimizeSubgroupsTable(sg);
        return;
    }

    var hor = $cell.children('.table_horizontal_divider');
    if ( hor.length ) {
        hor.find('.upper_week, .lower_week').each(function() {
            Timetable.prototype.optimizeCell($(this));
        });
        return;
    }

    [sg, hor].forEach(function (elem) {
        if (elem.height() < height && elem.height() !== null) {
            elem.css('height', height + 2);
        }
    });

    var short = $cell.children('.subject_short');
    var subj = $cell.children('.subject');

    if (short.length) {
        var subjs = (width < 180) || $cell.hasClass('short_force') ? [short, subj] : [subj, short];
        subjs[0].show();
        subjs[1].hide();
    }
};

Timetable.prototype.optimize = function () {
    'use strict';
    var i, j, row;
    if (!Array.isArray(this.cells)) {
        return;
    }
    for (i = 0; i < this.cells.length; ++i) {
        row = this.cells[i];
        for (j = 0; j < row.length; ++j) {
            this.optimizeCell(row[j]);
        }
    }
};
