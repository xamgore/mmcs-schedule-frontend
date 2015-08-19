/**
 * @param {object} data
 * @param {number} [data.week]
 * @constructor
 */
var Generator = function(data) {
    this.setWeek(+data.week || 0);
};

/**
 * @param {number} week
 */
Generator.prototype.setWeek = function(week) {
    this.week = week;
    this.weekClass = week ? 'lower_week' : 'upper_week';
};

Generator.prototype.getWorkspace = function($table) {
    var i, j;
    var topBar = [];
    var sideBar = [];
    var cells = [];
    var $base = $table.find('.timetable').first();

    var $topRow = $('<tr class=".tr_top"><td></td></tr>').appendTo($base);
    for (i = 0; i < 6; ++i) {
        var $dayCell = $('<td class="top" width="16%"></td>').appendTo($topRow);
        topBar.push($dayCell);
    }

    for (i = 0; i < 6; ++i) {
        cells[i] = [];
    }

    for (j = 0; j < 6; ++j) {
        var $row = $('<tr></tr>');
        var $leftElem = $('<td class="time"></td>').appendTo($row);
        sideBar.push($leftElem);

        for (i = 0; i < 6; ++i) {
            var cell = $('<td class="subject_cell"></td>').appendTo($row);
            cells[i].push(cell);
        }
        $base.append($row);
    }

    return {
        main: $base,
        top: topBar,
        side: sideBar,
        cells: cells
    };
};

Generator.prototype.getVertical = function(num) {
    var table = $('<table class="table_subgroups" border="0" cellspacing="0" cellpadding="0"><tr class="subgroups"></tr></table>');
    var sub = [];

    var $row = table.find('tr');
    for (var i = 0; i < num; ++i) {
        var sg = $('<td></td>').appendTo($row);
        sub.push(sg);
    }
    return {
        base: table,
        sub: sub
    };
};

Generator.prototype.getHorizontal = function() {

    var $table = $('<table class="table_horizontal_divider" border="0" cellspacing="0" cellpadding="0"></table>');
    var sub = [];

    ['upper_week', 'lower_week'].forEach(function(elemClass) {
        var $row = $('<tr></tr>').appendTo($table);
        var $cell = $('<td class="' + elemClass + '"></td>').appendTo($row);
        sub.push($cell);
    });
    $table.find('.' + this.weekClass).addClass('inactive_week');

    return {
        base: $table,
        sub: sub
    };
};


Generator.prototype.lmap = {
    subjectname: 'subject',
    subjectabbr: 'subject_short',
    teachername: 'lectuer',
    roomname: 'auditory'
};

Generator.prototype.fillCell = function(data, $cell) {
    var self = this;

    ['subjectname', 'subjectabbr', 'teachername', 'roomname'].forEach(function(type) {
        if (data[type]) {
            $cell.append('<p class="' + self.lmap[type] + '">' + data[type] + '</p>');
        }
    });
};

Generator.prototype.fillLayoutCell = function(cell, $base) {
    var split = cell.upper || cell.lower;
    var res = {
        full: $base,
        lower: null,
        upper: null
    };

    if (split) {
        var horizontal = this.getHorizontal();
        res.upper = horizontal.sub[0];
        res.lower = horizontal.sub[1];

        if (cell.full) {
            var vert = this.getVertical(2);
            res.full = vert.sub[0];
            vert.sub[1].append(horizontal.base);

            $base.append(vert.base);
        } else {
            $base.append(horizontal.base);
        }
    }

    return  res;
};

