var generator = {};

generator.getWorkspace = function($table) {
    var i, j;
    var topBar = [];
    var sideBar = [];
    var cells = [];

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
        top: topBar,
        side: sideBar,
        cells: cells
    };
};

generator.getVertical = function(num) {
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

generator.getHorizontal = function() {

    var $table = $('<table class="table_horizontal_divider" border="0" cellspacing="0" cellpadding="0"></table>');
    var sub = [];

    ['upper_week', 'lower_week'].forEach(function(elemClass) {
        var $row = $('<tr></tr>').appendTo($table);
        var $cell = $('<td class="' + elemClass + '"></td>').appendTo($row);
        sub.push($cell);
    });
    return {
        base: $table,
        sub: sub
    };
};


var lmap = {
    subjectname: 'subject',
    subjectabbr: 'subject_short',
    teachername: 'lectuer',
    roomname: 'auditory'
};

generator.fillCell = function(data, $cell) {
    ['subjectname', 'subjectabbr', 'teachername', 'roomname'].forEach(function(type) {
        if (data[type]) {
            $cell.append('<p class="' + lmap[type] + '">' + data[type] + '</p>');
        }
    });
};

generator.fillLayoutCell = function(cell, $base) {
    var split = cell.upper || cell.lower;
    var res = {
        full: $base,
        lower: null,
        upper: null
    };

    if (split) {
        var horiz = this.getHorizontal();
        res.upper = horiz.sub[0];
        res.lower = horiz.sub[1];

        if (cell.full) {
            var vert = this.getVertical(2);
            res.full = vert.sub[0];
            vert.sub[1].append(horiz.base);

            $base.append(vert.base);
        } else {
            $base.append(horiz.base);
        }
    }

    return  res;
};

