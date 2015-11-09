/* globals xMath */
(function () {
    'use strict';

    /**
     * Конструктор класса Table
     * @param {jQuery} $block  объект таблицы
     * @param {array}  data    матрица с занятиями
     * @param {array}  times левая колоннка таблицы
     * @param {array}  header шапка таблицы
     */
    var Table = window.Table = function ($block, data, times, header) {
        this.$block = $block;
        this.times = times;
        this.header = header;
        this.data = data;

        this.setRows();
        this.setCols();
    };

    /**
     * Заполненение необъявленных ключей data для корректной работы forEach
     */
    Table.prototype.prepareData = function () {
        this.data.forEach(function (line) {
            for (var lineKey = 0, lineLength = line.length; lineKey < lineLength; lineKey++) {
                var cell = line[lineKey];

                if (!cell) {
                    line[lineKey] = null;
                    continue;
                }

                for (var cellKey = 0, cellLength = cell.length; cellKey < cellLength; cellKey++) {
                    var week = cell[cellKey];

                    if (!week) {
                        cell[cellKey] = null;
                        continue;
                    }

                    for (var weekKey = 0, weekLength = week.length; weekKey < weekLength; weekKey++) {
                        var group = week[weekKey];

                        if (!group) {
                            week[weekKey] = null;
                            continue;
                        }
                    }
                }
            }
        });
    };

    /**
     * Заполнение массива строк
     */
    Table.prototype.setRows = function () {
        this.rows = new Array(this.data.length);
        for (var rowsKey = 0, rowsLength = this.rows.length; rowsKey < rowsLength; rowsKey++) {
            this.rows[rowsKey] = new TableRow(this.data[rowsKey], this, rowsKey);
        }
    };

    /**
     * Заполнение массива строк
     */
    Table.prototype.setCols = function () {
        this.cols = new Array(this.rows[0].cells.length);
        for (var colsKey = 0, colsLength = this.cols.length; colsKey < colsLength; colsKey++) {
            this.cols[colsKey] = new TableCol(this.rows.map(function (row) {
                return row.cells[colsKey];
            }), this, colsKey);
        }
    };

    /**
     * Отрисовка таблицы
     */
    Table.prototype.draw = function () {
        this.$block.html('');

        var $headerLine = $('<tr><td></td></tr>').appendTo($('<thead></thead>').appendTo(this.$block));
        this.header.forEach(function (columnTitle, i) {
            $('<td colspan=' + this.cols[i].length + ' class="title">' + columnTitle + '</td>').appendTo($headerLine);
        }, this);

        this.$body = $('<tbody></tbody>').appendTo(this.$block);

        this.rows.forEach(function (row) {
            row.draw();
        });
    };

    /**
     * Деструктор класса Table
     */
    Table.prototype.destruct = function () {};


    /**
     * Конструктор класса TableRow
     * @param {array|object} cellsRaw массив ячеек
     * @param {object}       table    таблица
     * @param {integer}      pos      номер строки
     */
    var TableRow = function (cellsRaw, table, pos) {
        this.table = table;
        this.pos = pos;

        this.cells = cellsRaw.map(function (cellRaw) {
            return new TableCell(cellRaw, this, null);
        }, this);
        this.length = xMath.lcm.apply(xMath, this.cells.map(function (cell) {
            return cell.vLength;
        }));
    };

    /**
     * Отрисовка строки таблицы
     */
    TableRow.prototype.draw = function () {
        this.lines = new Array(this.length);
        for (var linesKey = 0, linesLength = this.lines.length; linesKey < linesLength; linesKey++) {
            this.lines[linesKey] = $('<tr></tr>').appendTo(this.table.$body);
        }

        $('<td rowspan=' + this.length + ' class="time">' + this.table.times[this.pos] + '</td>').appendTo(this.lines[0]);

        this.cells.forEach(function (cell) {
            cell.draw();
        });
    };


    /**
     * Конструктор класса TableCol
     * @param {array|object} cellsRaw массив ячеек
     * @param {object}       table    таблица
     * @param {integer}      pos      номер колонки
     */
    var TableCol = function (cellsRaw, table, pos) {
        this.table = table;
        this.pos = pos;

        this.cells = cellsRaw.map(function (cellRaw) {
            return new TableCell(cellRaw, null, this);
        }, this);
        this.length = xMath.lcm.apply(xMath, this.cells.map(function (cell) {
            return cell.hLength;
        }));
    };


    /**
     * Конструктор класса TableCell
     * @param {array}  cellRaw ячейка
     * @param {object} row     строка
     * @param {object} col     колонка
     */
    var TableCell = function (cellRaw, row, col) {
        // Проверка на созданность объекта
        if (cellRaw instanceof TableCell) {
            if (row) {
                cellRaw.row = row;
            }
            if (col) {
                cellRaw.col = col;
            }
            return cellRaw;
        }

        this.row = row;
        this.col = col;

        if (!cellRaw) {
            this.empty = true;
            this.vLength = 2;
            this.hLength = 1;

            return;
        }

        this.weeks = cellRaw.map(function (weekRaw, pos) {
            return new TableWeek(weekRaw, this, pos);
        }, this);
        this.vLength = this.weeks.length * 2;
        this.hLength = xMath.lcm.apply(xMath, this.weeks.map(function (week) {
            return week.length;
        }));
    };

    /**
     * Отрисовка ячейки
     */
    TableCell.prototype.draw = function () {
        if (this.empty) {
            $('<td rowspan=' + this.row.length + ' colspan=' + this.col.length + '></td>').appendTo(this.row.lines[0]);
            return;
        }

        this.weeks.forEach(function (week) {
            week.draw();
        });
    };


    /**
     * Конструктор класса TableWeek
     * @param {array}   weekRaw неделя
     * @param {object}  cell    ячейка
     * @param {integer} pos     номер недели
     */
    var TableWeek = function (weekRaw, cell, pos) {
        this.cell = cell;
        this.pos = pos;

        if (!weekRaw) {
            this.empty = true;
            this.length = 1;

            return;
        }

        this.groups = weekRaw.map(function (groupRaw) {
            return new TableGroup(groupRaw, this);
        }, this);
        this.length = xMath.sum.apply(xMath, this.groups.map(function (group) {
            return group.length;
        }));
    };

    /**
     * Отрисовка недели
     */
    TableWeek.prototype.draw = function () {
        if (this.empty) {
            var rowSize = this.cell.row.length / this.cell.vLength * 2;
            var colLength = this.cell.col.length;
            var lines = this.cell.row.lines;
            $('<td rowspan=' + rowSize + ' colspan=' + colLength + '></td>').appendTo(lines[this.pos * rowSize]);
            return;
        }

        this.groups.forEach(function (group) {
            group.draw();
        });
    };


    /**
     * Конструкотор класса TableGroup
     * @param {object} groupRaw группа занятий
     * @param {object} week     неделя
     */
    var TableGroup = function (groupRaw, week) {
        this.week = week;

        if (!groupRaw) {
            this.empty = true;
            this.length = 1;

            return;
        }

        this.title = groupRaw.title;
        this.length = groupRaw.contents.length;
        this.contents = groupRaw.contents;
    };

    /**
     * Отрисвка группы предметов
     */
    TableGroup.prototype.draw = function () {
        var rowSize = this.week.cell.row.length / this.week.cell.vLength * 2;
        var colSize = this.week.cell.col.length / this.week.length;
        var lines = this.week.cell.row.lines;
        var pos = this.week.pos * rowSize;

        if (this.empty) {
            $('<td rowspan=' + rowSize + ' colspan=' + colSize * this.length + '></td>').appendTo(lines[pos]);
            return;
        }

        if (this.length > 1) {
            $('<td colspan=' + colSize * this.length + ' class="sub-cell-title multi">' + this.title + '</td>').appendTo(lines[pos]);
            this.contents.forEach(function (content) {
                $('<td rowspan=' + (rowSize - 1) + ' colspan=' + colSize + ' class="sub-cell-content multi">' + content + '</td>').appendTo(lines[pos + 1]);
            });
        } else {
            $('<td rowspan=' + rowSize / 2 + ' colspan=' + colSize * this.length + ' class="sub-cell-title">' + this.title + '</td>').appendTo(lines[pos]);
            var content = this.contents[0];
            $('<td rowspan=' + rowSize / 2 + ' colspan=' + colSize + ' class="sub-cell-content">' + content + '</td>').appendTo(lines[pos + rowSize / 2]);
        }
    };
})();
