function Timetable($base) {
    this.$table = $base;
}

Timetable.prototype.erase = function() {
    this.$table.html(''); // clear workspace
};

Timetable.prototype.hide = function() {
    this.$table.hide();
};

Timetable.prototype.show = function() {
    this.$table.show();
};

Timetable.prototype.create = function() {
    this.hide();
    this.erase();

    var table = generator.getWorkspace(this.$table);
    this.cells = table.cells;

    this.bar = {
        top: table.top,
        side: table.side
    };
};

// type = ('side', 'top')
Timetable.prototype.fillBar = function(data, type) {
    var bar = this.bar[type];
    if (bar && data) {
        bar.forEach(function (elem, i) {
            if (!(data[i] || elem)) {
                return;
            }
            elem.html(data[i]);
        });
    }
};



Timetable.prototype.gatherMetrics = function(schedule) {
    var metrics = [];

    $.each(schedule.lessons, function(i, dayStrip) {
        var metricDay = metrics[i] = [];
        dayStrip.forEach(function(lesson) {
            var dst = metricDay[lesson.begNum];
            var splitType = lesson.timeslot.split;
            if (!dst) {
                dst = metricDay[lesson.begNum] = { cnt: 0 };
            }
            dst[splitType] = Math.max(dst[splitType] || 0, lesson.subcount);
            dst.cnt += 1;
        });
    });
    return metrics;
};

Timetable.prototype.createLayout = function(schedule) {
    var metrics = this.gatherMetrics(schedule);
    var layout = [];
    var self = this;

    metrics.forEach(function(day, dayNum) {
        layout[dayNum] = [];
        day.forEach(function(metricCell, lesNum) {
            var $base = self.cells[dayNum][lesNum];
            layout[dayNum][lesNum] = generator.fillLayoutCell(metricCell, $base);
        });
    });
    return layout;
};




Timetable.prototype.createLesson = function (curricula, lesson, $cell) {
    if (!(curricula || lesson)) {
        return;
    }

    var table = {sub: [$cell]};
    if (curricula.length > 1) {
        table = generator.getVertical(lesson.subcount);
        $cell.append(table.base);
    }

    curricula.forEach(function(curriculum) {
        var sgNum = curriculum.subnum - 1;
        generator.fillCell(curriculum, table.sub[sgNum]);
    });
};

Timetable.prototype.draw = function(schedule) {
    this.create();
    this.fillBar(days, 'top');
    this.fillBar(timeList, 'side');

    var self = this;
    var layout = this.createLayout(schedule);


    // todo: delete debug info
    console.log(layout);
    console.log(schedule);

    $.each(schedule.lessons, function(dayNum, dayLessons) {
        dayLessons.forEach(function(lesson) {
            var curricula = schedule.curricula[lesson.id];
            var splitType = lesson.timeslot.split;
            var $cell = layout[dayNum][lesson.begNum][splitType];

            self.createLesson(curricula, lesson, $cell);
        });
    });

    this.show();
};

