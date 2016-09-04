/* globals xMath */
(function () {
    'use strict';

    /**
     * Конструктор класса Table
     * @param {jQuery} $block объект таблицы
     * @param {array}  data   матрица с занятиями
     * @param {array}  times  левая колоннка таблицы
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
        this.data.forEach(function (row) {
            for (var rowKey = 0, rowLength = row.length; rowKey < rowLength; rowKey++) {
                var cell = row[rowKey];

                if (!cell) {
                    row[rowKey] = null;
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

        var $header = $('<thead></thead>').appendTo(this.$block);
        var $headerRow = $('<tr><td></td></tr>').appendTo($header);
        this.header.forEach(function (columnTitle, i) {
            $('<td colspan=' + this.cols[i].length + ' class="title">' + columnTitle + '</td>').appendTo($headerRow).data('size', this.cols[i].size);
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
        this.size = Math.max.apply(Math, this.cells.map(function (cell) {
            return cell.vLength;
        }));
        this.length = xMath.lcm.apply(xMath, xMath.range(1, this.size));
    };

    /**
     * Отрисовка строки таблицы
     */
    TableRow.prototype.draw = function () {
        this.rows = new Array(this.length);
        for (var rowsKey = 0, rowsLength = this.rows.length; rowsKey < rowsLength; rowsKey++) {
            this.rows[rowsKey] = $('<tr></tr>').appendTo(this.table.$body);
        }

        $('<td rowspan=' + this.length + ' class="time">' + this.table.times[this.pos] + '</td>').appendTo(this.rows[0]);

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
        this.size = Math.max.apply(Math, this.cells.map(function (cell) {
            return cell.hLength;
        }));
        this.length = xMath.lcm.apply(xMath, xMath.range(1, this.size));
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
        this.hLength = Math.max.apply(Math, this.weeks.map(function (week) {
            return week.length;
        }));
    };

    /**
     * Отрисовка ячейки
     */
    TableCell.prototype.draw = function () {
        if (this.empty) {
            $('<td rowspan=' + this.row.length + ' colspan=' + this.col.length + '></td>').appendTo(this.row.rows[0]);
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
            var rows = this.cell.row.rows;
            $('<td rowspan=' + rowSize + ' colspan=' + colLength + ' class="cell-empty"></td>').appendTo(rows[this.pos * rowSize]);
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
     * Отрисвка группы занятий
     */
    TableGroup.prototype.draw = function () {
        var rowSize = this.week.cell.row.length / this.week.cell.vLength * 2;
        var colSize = this.week.cell.col.length / this.week.length;
        var rows = this.week.cell.row.rows;
        var pos = this.week.pos * rowSize;

        if (this.empty) {
            $('<td rowspan=' + rowSize + ' colspan=' + colSize + '></td>').appendTo(rows[pos]);
            return;
        }

        if (this.length > 1) {
            $('<td colspan=' + colSize * this.length + ' class="cell-title">' + this.title + '</td>').appendTo(rows[pos]);
            this.contents.forEach(function (content) {
                $('<td rowspan=' + (rowSize - 1) + ' colspan=' + colSize + ' class="cell-content">' + content + '</td>').appendTo(rows[pos + 1]);
            });
        } else {
            $('<td rowspan=' + rowSize + ' colspan=' + colSize + ' class="cell-full">' + this.title + this.contents[0] + '</td>').appendTo(rows[pos]);
        }
    };
})();