/**
 * @param {Generator}   generator
 * @param {object}      data
 *
 * @param {jQuery}      data.base
 *
 * @constructor
 */
function Timetable(generator, data) {
    'use strict';

    this.$base = data.base;
    this.gen = generator;
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

    if (this.$table) {
        this.show(false);
        this.$table.html('');
    }
};


/**
 * show/hide timetable/welcome page
 * @param {bool} state
 */
Timetable.prototype.show = function (state) {
    'use strict';
    if (!this.$table) {
        return;
    }
    if (state) {
        $('.welcome_wrapper').hide();
        this.$base.show();
        $('.print_schedule').show(); // todo: what this??
    } else {
        this.$base.hide();
        $('.print_schedule').hide();
        $('.welcome_wrapper').show();
    }
};


Timetable.prototype.create = function () {
    'use strict';
    this.erase();
    this.created = true;

    var table = this.gen.getWorkspace(this.$base);
    this.cells = table.cells;
    this.$table = table.main;

    this.bar = {
        top: table.top,
        side: table.side
    };
};


/**
 * fill timetable info bars (time, days, etc)
 * @param {string} type     possible types: 'side', 'top'
 * @param {string[]} data
 */
Timetable.prototype.fillBar = function (type, data) {
    'use strict';
    if (!(data && this.bar && this.bar[type])) {
        return;
    }
    var bar = this.bar[type];
    bar.forEach(function (barCell, i) {
        //if (!(data[i] || barCell)) {
        //    return;
        //}
        barCell.html(data[i]);
    });
};


Timetable.prototype.gatherMetrics = function (schedule) {
    'use strict';
    var metrics = [];

    $.each(schedule.lessons, function (i, dayStrip) {
        var metricDay = metrics[i] = [];
        dayStrip.forEach(function (lesson) {
            var dst = metricDay[lesson.begNum];
            var splitType = lesson.timeslot.split;
            if (!dst) {
                dst = metricDay[lesson.begNum] = {cnt: 0};
            }
            dst[splitType] = Math.max(dst[splitType] || 0, lesson.subcount);
            dst.cnt += 1;
        });
    });
    return metrics;
};

Timetable.prototype.createLayout = function (schedule) {
    'use strict';
    var metrics = this.gatherMetrics(schedule);
    var layout = [];
    var self = this;

    metrics.forEach(function (day, dayNum) {
        layout[dayNum] = [];
        day.forEach(function (metricCell, lesNum) {
            var $base = self.cells[dayNum][lesNum];
            layout[dayNum][lesNum] = self.gen.fillLayoutCell(metricCell, $base);
        });
    });
    return layout;
};


Timetable.prototype.createLesson = function (curricula, lesson, $cell) {
    'use strict';
    var self = this;

    if (!(curricula && lesson)) {
        return;
    }

    $cell.addClass('uberCell');
    $cell.attr('id', 'lesID_' + lesson.id);

    var table = {sub: [$cell]};
    if (lesson.subcount > 1) {
        table = this.gen.getVertical(lesson.subcount);
        $cell.append(table.base);
    }

    curricula.forEach(function (curriculum) {
        var sgNum = curriculum.subnum - 1;
        self.gen.fillCell(curriculum, table.sub[sgNum]);
    });
};

Timetable.prototype.draw = function (schedule) {
    'use strict';
    this.create();
    // todo: hardcode data
    this.fillBar('top', days);
    this.fillBar('side', timeList);

    var self = this;
    var layout = this.createLayout(schedule);
    this.layout = layout;
    this.schedule = schedule;


    // todo: delete debug info
    console.log(layout);
    console.log(schedule);

    $.each(schedule.lessons, function (dayNum, dayLessons) {
        dayLessons.forEach(function (lesson) {
            var curricula = schedule.curricula[lesson.id];
            var splitType = lesson.timeslot.split;
            var $cell = layout[dayNum][lesson.begNum][splitType];

            self.createLesson(curricula, lesson, $cell);
        });
    });

    this.show(true);
};


Timetable.prototype.optimize = function() {
    $('.subject_cell').each(function () {
        if (($(this).children('.table_subgroups').height() < $(this).height()) && ($(this).children('.table_subgroups').height() != null))
            $(this).children('.table_subgroups').css('height', $(this).height() + 2);
        if (($(this).children('.table_horizontal_divider').height() < $(this).height()) && ($(this).children('.table_horizontal_divider').height() != null))
            $(this).children('.table_horizontal_divider').css('height', $(this).height() + 2);
        if ($(this).find('.subject_short').length)
            if ($(this).width() < 180) {
                $(this).find('.subject').css('display', 'none');
                if ($(this).find('.subject_short').css('display') == 'none')
                    $(this).find('.subject_short').css('display', 'block');
            }
            else {
                $(this).find('.subject_short').css('display', 'none');
                if ($(this).find('.subject').css('display') == 'none')
                    $(this).find('.subject').css('display', 'block');
            }
    });
};
