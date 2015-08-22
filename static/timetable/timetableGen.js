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
    var table = $('<table class="table_subgroups" border="0" cellspacing="0" cellpadding="0">' +
        '<tr class="subgroups subgroups_subject"></tr>' +
        '<tr class="subgroups subgroups_teacher"></tr>' +
        '</table>');
    var sub = [];

    var $subject_row = table.find('tr.subgroups_subject');
    var $teacher_row = table.find('tr.subgroups_teacher');
    for (var i = 0; i < num; ++i) {
        var sg_subj = $('<td></td>').appendTo($subject_row);
        var sg_teach = $('<td></td>').appendTo($teacher_row);
        sub.push( {$subjectCell: sg_subj, $teacherCell: sg_teach} );
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

/**
 * @param {curriculum_t} curriculum
 * @param {jQuery} $subjectCell
 * @param {jQuery} $teacherCell
 */
Generator.prototype.fillCell = function (curriculum, $subjectCell, $teacherCell) {
    'use strict';

    var self = this;
    if (!$subjectCell || !$teacherCell) {
        // todo: debug info
        console.log('invalid cell!', curriculum);
        return;
    }

    $subjectCell.append('<p class="' + self.lmap['subjectname'] + '">' + curriculum['subjectname'] + '</p>');
    $subjectCell.append('<p class="' + self.lmap['subjectabbr'] + '">'
        + '<abbr title="' + curriculum['subjectname'] + '">' + curriculum['subjectabbr'] + '</abbr></p>');

    $teacherCell.append('<p class="' + self.lmap['teachername'] + '">'
        + '<abbr title="' + curriculum['teachername'] + '">' + self.abbrName(curriculum['teachername']) + '</abbr></p>');
    $teacherCell.append('<p class="' + self.lmap['roomname'] + '">' + curriculum['roomname'] + '</p>');
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

