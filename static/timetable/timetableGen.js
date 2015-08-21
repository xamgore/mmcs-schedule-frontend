/**
 * @param {object} data
 * @param {number} [data.week]
 * @constructor
 */
var Generator = function (data) {
    this.setWeek(+data.week || 0);
};


/**
 * @param {number} week
 */
Generator.prototype.setWeek = function (week) {
    this.week = week;
    this.weekClass = week ? 'upper_week' : 'lower_week';
};

Generator.prototype.getWorkspace = function ($tableBase) {
    var i, j;
    var topBar = [];
    var sideBar = [];
    var cells = [];
    var $table = $tableBase.find('.timetable').first();

    var $topRow = $('<tr class=".tr_top"><td></td></tr>').appendTo($table);
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
        $table.append($row);
    }

    return {
        table: $table,
        cells: cells,
        bars: {
            top: topBar,
            side: sideBar
        }
    };
};

Generator.prototype.getVertical = function (num, $cell) {
    'use strict';
    var table = $('<table class="table_subgroups" border="0" cellspacing="0" cellpadding="0"><tr class="subgroups"></tr></table>');
    var sub = [];

    var $row = table.find('tr');
    for (var i = 0; i < num; ++i) {
        var sg = $('<td></td>').appendTo($row);
        sub.push(sg);
    }

    $cell.append(table);
    return sub;
};

Generator.prototype.getHorizontal = function ($base) {

    var $table = $('<table class="table_horizontal_divider" border="0" cellspacing="0" cellpadding="0"></table>');
    var sub = [];

    ['upper_week', 'lower_week'].forEach(function (elemClass) {
        var $row = $('<tr></tr>').appendTo($table);
        var $cell = $('<td class="' + elemClass + '"></td>').appendTo($row);
        sub.push($cell);
    });
    $table.find('.' + this.weekClass).addClass('inactive_week');
    $base.append($table);

    return sub;
};


Generator.prototype.lmap = {
    subjectname: 'subject',
    subjectabbr: 'subject_short',
    teachername: 'lectuer',
    roomname: 'auditory'
};

Generator.prototype.abbrName = function(name) {
    var n = name.split(' ');
    if ( n.length === 3 )
        return n[0] + ' ' + n[1][0] + '.' + n[2][0] + '.';
    else
        return name;
};

Generator.prototype.fillCell = function (curriculum, $cell) {
    var self = this;
    if (!$cell) {
        // todo: debug info
        console.log('invalid cell!', curriculum);
        return;
    }

    ['subjectname', 'subjectabbr', 'teachername', 'roomname'].forEach(function (type) {
        var data = curriculum[type];
        if (data) {
            if ( type === 'teachername' )
                $cell.append('<p class="' + self.lmap[type] + '"><abbr title="' + data + '">' + self.abbrName(data) + '</abbr></p>');
            else
                $cell.append('<p class="' + self.lmap[type] + '">' + data + '</p>');
        }
    });
};

Generator.prototype.fillLayoutCell = function (cell, $base) {
    var res = { full: $base };
    if (!cell) {
        return res;
    }

    var split = cell.upper || cell.lower;
    if (split) {
        var horBase = $base;
        if (cell.full) {
            var vertCell = this.getVertical(2, $base); // full & divided cells
            res.full = vertCell[0];
            horBase = vertCell[1];
        }
        var horCell = this.getHorizontal(horBase);

        res.upper = horCell[0];
        res.lower = horCell[1];
    }
    return res;
};

