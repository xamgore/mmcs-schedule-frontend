/* globals xMath */
(function () {
    'use strict';

    /**
     * Конструктор класса Table
     * @param {array}  data   матрица с занятиями
     * @param {array}  times  левая колоннка таблицы
     * @param {array}  header шапка таблицы
     */
    var Table = window.Table = function (data, times, header) {
        this.times = times;
        this.header = header;
        this.data = data;

        this.setRows();
        this.setCols();
    };

    /**
     * Заполнение массива строк
     * @return {Table} this
     */
    Table.prototype.setRows = function () {
        this.rows = new Array(this.data.length);
        for (let rowsKey = 0, rowsLength = this.rows.length; rowsKey < rowsLength; rowsKey++) {
            this.rows[rowsKey] = new TableRow(this.data[rowsKey], this, rowsKey);
        }

        return this;
    };

    /**
     * Заполнение массива строк
     * @return {Table} this
     */
    Table.prototype.setCols = function () {
        this.cols = new Array(this.rows[0].cells.length);
        for (let colsKey = 0, colsLength = this.cols.length; colsKey < colsLength; colsKey++) {
            this.cols[colsKey] = new TableCol(this.rows.map(row => row.cells[colsKey]), this, colsKey);
        }

        return this;
    };

    /**
     * Отрисовка таблицы
     * @param   {jQuery}    $table  объект таблицы
     * @return  {Table}             this
     */
    Table.prototype.draw = function ($table) {
        let $header = $('<thead></thead>').appendTo($table);
        let $headerRow = $('<tr><td></td></tr>').appendTo($header);
        this.header.forEach((columnTitle, i) => {
            $(`<td colspan=${this.cols[i].length} class="title">${columnTitle}</td>`).appendTo($headerRow);
        });

        this.$body = $('<tbody></tbody>').appendTo($table);
        this.rows.forEach(row => row.draw());

        return this;
    };


    /**
     * Конструктор класса TableRow
     * @param {array|object} cellsRaw массив ячеек
     * @param {object}       table    таблица
     * @param {integer}      pos      номер строки
     */
    var TableRow = function (cellsRaw, table, pos) {
        this.table = table;
        this.pos = pos;

        this.cells = cellsRaw.map(cellRaw => new TableCell(cellRaw, this, null));
        this.size = Math.max.apply(Math, this.cells.map(cell => cell.vLength));
        this.length = xMath.lcm.apply(xMath, xMath.range(1, this.size));
    };

    /**
     * Отрисовка строки таблицы
     * @return {TableRow} this
     */
    TableRow.prototype.draw = function () {
        this.rows = new Array(this.length);
        for (let rowsKey = 0, rowsLength = this.rows.length; rowsKey < rowsLength; rowsKey++) {
            this.rows[rowsKey] = $('<tr></tr>').appendTo(this.table.$body);
        }

        $(`<td rowspan=${this.length} class="time">${this.table.times[this.pos]}</td>`).appendTo(this.rows[0]);

        this.cells.forEach(cell => cell.draw());

        return this;
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

        this.cells = cellsRaw.map(cellRaw =>new TableCell(cellRaw, null, this));
        this.size = Math.max.apply(Math, this.cells.map(cell => cell.hLength));
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

        this.weeks = cellRaw.map((weekRaw, pos) => new TableWeek(weekRaw, this, pos));
        this.vLength = this.weeks.length * 2;
        this.hLength = Math.max.apply(Math, this.weeks.map(week => week.length));
    };

    /**
     * Отрисовка ячейки
     * @return {TableCell} this
     */
    TableCell.prototype.draw = function () {
        if (this.empty) {
            $(`<td rowspan=${this.row.length} colspan=${this.col.length}></td>`).data('width', 1).appendTo(this.row.rows[0]);
            return this;
        }

        this.weeks.forEach(week => week.draw());

        return this;
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

        this.groups = weekRaw.map(groupRaw => new TableGroup(groupRaw, this));
        this.length = xMath.sum.apply(xMath, this.groups.map(group => group.length));
    };

    /**
     * Отрисовка недели
     * @return {TableWeek} this
     */
    TableWeek.prototype.draw = function () {
        this.rowSize = this.cell.row.length / this.cell.vLength * 2;
        this.colSize = this.cell.col.length / this.length;
        let rowPos = this.pos * this.rowSize;
        this.rows = [ this.cell.row.rows[rowPos], this.cell.row.rows[rowPos + 1] ];

        if (this.empty) {
            $(`<td rowspan=${this.rowSize} colspan=${this.colSize} class="cell-empty"></td>`)
                .data('width', 1).appendTo(this.cell.row.rows[this.pos * this.rowSize]);
            return this;
        }

        let colPos = this.rows[0].children().length;
        this.groups.forEach(group => group.draw());
        this.rows[0].children().eq(colPos).data('width', this.length);

        return this;
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
     * @return {TableWeek} this
     */
    TableGroup.prototype.draw = function () {
        if (this.empty) {
            $(`<td rowspan=${this.week.rowSize} colspan=${this.week.colSize}></td>`).appendTo(this.week.rows[0]);
            return this;
        }

        if (this.length > 1) {
            $(`<td colspan=${this.week.colSize * this.length} class="cell-title">${this.title}</td>`).appendTo(this.week.rows[0]);
            this.contents.forEach(content => {
                $(`<td rowspan=${this.week.rowSize - 1} colspan=${this.week.colSize} class="cell-content">${content}</td>`).appendTo(this.week.rows[1]);
            });
        } else {
            $(`<td rowspan=${this.week.rowSize} colspan=${this.week.colSize} class="cell-full">${this.title}${this.contents[0]}</td>`).appendTo(this.week.rows[0]);
        }

        return this;
    };
})();
