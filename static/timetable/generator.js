var Generator = function () {
    'use strict';
};



(function () {
    'use strict';

    Generator.prototype.tune = function (data) {
        this.data = data;
        switch (data.type) {
        case 'group':
            Generator.prototype.fillCell = Generator.prototype.fillGroupCell;
            break;
        case 'teacher':
            Generator.prototype.fillCell = Generator.prototype.fillTeacherCell;
            break;
        }
    };

    Generator.prototype.setLesson = function (lesson) {
        this.lesson = lesson;
    };


// =================================
//      layout
// =================================

    Generator.prototype.createWorkspace = function (data) {

        var table = $(data.base).find('.timetable').first();

        var i, j;
        var topBar = [];
        var sideBar = [];
        var cells = [];

        var $topRow = $('<tr class=".tr_top"><td></td></tr>').appendTo(table);
        for (i = 0; i < 6; ++i) {
            var $dayCell = $('<td class="top" width="16%"></td>').appendTo($topRow);
            topBar.push($dayCell);
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
            table.append($row);
        }

        return {
            table: table,
            cells: cells,
            top: topBar,
            side: sideBar,
            rows: data.rows,
            cols: data.cols
        };
    };


    Generator.prototype.getVertical = function (num, $cell) {
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

    Generator.prototype.splitHorizontal = function (base) {
        var $table = $('<table class="table_horizontal_divider" border="0" cellspacing="0" cellpadding="0"></table>');
        var sub = [];

        ['upper_week', 'lower_week'].forEach(function (elemClass) {
            var $row = $('<tr></tr>').appendTo($table);
            var $cell = $('<td class="' + elemClass + '"></td>').appendTo($row);
            sub.push($cell);
        });
        $table.find('.' + this.weekClass).addClass('inactive_week');

        base.append($table);
        return sub;
    };

    /**
     * @param {int} rows
     * @param {int} cols
     * @param {jQuery} base
     * @param {integer[]=} fullSubgroups
     * @returns {jQuery[][]}
     */
    Generator.prototype.createTable = function (rows, cols, base, fullSubgroups) {
        var table = $('<table class="cell_grid" cellspacing="0" cellpadding="0"></table>');
        var sub = [];

        for (var i = 0; i < rows; ++i) {
            var rowCells = sub[i] = [];
            var row = $('<tr></tr>').appendTo(table);

            for (var j = 0; j < cols; ++j) {
                rowCells[j] = $('<td></td>').appendTo(row);
            }
        }

        if (Array.isArray(fullSubgroups) || rows > 1) {
            fullSubgroups.forEach(function (sgNum) {
                sub[0][sgNum].prop('rowspan', rows);
                for (var i = 1; i < rows; ++i) {
                    sub[i][sgNum].remove();
                }
            });
        }

        base.append(table);
        return sub;
    };






// =================================
//      curriculum cell
// =================================

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




// =================================
//      fill modes
// =================================


    Generator.prototype.fillGroupCell = function (curriculum, $cell) {
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



    Generator.prototype.getGroupList = function() {
        var groups = '';
        var lesson = this.lesson;

        this.data.groups[lesson.uberid].forEach(function (sgroup) {
            groups += (sgroup.degree === 'master' ? 'M' : '' ) + sgroup.name + ', ';
        });
        return groups.replace(/[, ]+$/, '');
    };

    Generator.prototype.fillTeacherCell = function (curriculum, $cell) {
        var self = this;

        if (!$cell) {
            // todo: debug info
            console.log('invalid cell!', curriculum);
            return;
        }

        ['subjectname', 'subjectabbr', 'roomname'].forEach(function (type) {
            var data = curriculum[type];
            if (data) {
                $cell.append('<p class="' + self.lmap[type] + '">' + data + '</p>');
            }
        });

        // todo: check
        var groups = this.getGroupList();
        $cell.append('<p class="groups">' + groups + '</p>');

    };

} ());
