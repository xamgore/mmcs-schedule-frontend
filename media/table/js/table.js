(() => {
    'use strict';

    let lengths = [ 1, 2, 6, 12, 60, 60, 420, 840 ];

    class Table {
        /**
         * @param {array}  data    Матрица с занятиями
         * @param {array}  times   Левая колоннка таблицы
         * @param {array}  header  Шапка таблицы
         * @param {string} weekday День недели
         */
        constructor(data, times, header, weekday) {
            this.times = times;
            this.header = header;
            this.weekday = weekday;
            this.data = data;

            this.setRows();
            this.setCols();
        }

        /**
         * Заполнение массива строк
         * @return {Table} this
         */
        setRows() {
            this.rows = new Array(this.data.length);
            for (let rowsKey = 0, rowsLength = this.rows.length; rowsKey < rowsLength; rowsKey++) {
                this.rows[rowsKey] = new TableRow(this.data[rowsKey], this, rowsKey);
            }

            return this;
        }

        /**
         * Заполнение массива строк
         * @return {Table} this
         */
        setCols() {
            this.cols = new Array(this.rows[0].cells.length);
            for (let colsKey = 0, colsLength = this.cols.length; colsKey < colsLength; colsKey++) {
                this.cols[colsKey] = new TableCol(this.rows.map(row => row.cells[colsKey]), this, colsKey);
            }

            return this;
        }

        /**
         * Отрисовка таблицы
         * @param  {jQuery} $table Объект таблицы
         * @return {Table}         this
         */
        draw($table) {
            let $header = $('<thead></thead>').appendTo($table);
            let $wRow = $('<tr class="service"><td id="bodySize"></td></tr>').appendTo($header);
            let $tRow = $(`<tr><td>${this.weekday}</td></tr>`).appendTo($header);
            let colWidth = `${95 / this.header.length}%`;
            this.header.forEach((columnTitle, index) => {
                $(`<td colspan=${this.cols[index].length}></td>`).css('width', colWidth).appendTo($wRow);
                $(`<td colspan=${this.cols[index].length} class="title"><span>${columnTitle}</span></td>`).appendTo($tRow);
            });
            $wRow.children().first().css('width', '50px');
            $wRow.children().last().css('width', 'auto');

            let width = helpers.sum.apply(helpers, this.cols.map(({ length }) => length)) + 1;
            let height = helpers.sum.apply(helpers, this.rows.map(({ length }) => length));
            $wRow.find("#bodySize").data({ width, height });

            this.$body = $('<tbody></tbody>').appendTo($table);
            this.rows.forEach(row => row.draw());

            return this;
        }
    }

    class TableRow {
        /**
         * @param {array|object} cellsRaw Массив ячеек
         * @param {object}       table    Таблица
         * @param {integer}      pos      Номер строки
         */
        constructor(cellsRaw, table, pos) {
            this.table = table;
            this.pos = pos;

            this.cells = cellsRaw.map(cellRaw => new TableCell(cellRaw, this, null));
            this.size = Math.max.apply(Math, this.cells.map(cell => cell.vLength));
            this.length = lengths[this.size - 1];
        }

        /**
         * Отрисовка строки таблицы
         * @return {TableRow} this
         */
        draw() {
            this.rows = new Array(this.length);
            for (let rowsKey = 0, rowsLength = this.rows.length; rowsKey < rowsLength; rowsKey++) {
                this.rows[rowsKey] = $('<tr></tr>').appendTo(this.table.$body);
            }

            $(`<td rowspan=${this.length} class="time">${this.table.times[this.pos]}</td>`).appendTo(this.rows[0]);

            this.cells.forEach(cell => cell.draw());

            return this;
        }
    }

    class TableCol {
        /**
         * @param {array|object} cellsRaw Массив ячеек
         * @param {object}       table    Таблица
         * @param {integer}      pos      Номер колонки
         */
        constructor(cellsRaw, table, pos) {
            this.table = table;
            this.pos = pos;

            this.cells = cellsRaw.map(cellRaw => new TableCell(cellRaw, null, this));
            this.size = Math.max.apply(Math, this.cells.map(cell => cell.hLength));
            this.length = lengths[this.size - 1];
        }
    }

    class TableCell {
        /**
         * @param {array}  cellRaw Ячейка
         * @param {object} row     Строка
         * @param {object} col     Колонка
         */
        constructor(cellRaw, row, col) {
            // Проверка на созданность объекта
            if (cellRaw instanceof TableCell) {
                if (row) cellRaw.row = row;
                if (col) cellRaw.col = col;
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

            if (this.vLength >= lengths.length || this.hLength >= lengths.length) {
                this.empty = true;
                this.vLength = 2;
                this.hLength = 1;
                console.log(new Error('Very big cell'), cellRaw);
            };
        }

        /**
         * Отрисовка ячейки
         * @return {TableCell} this
         */
        draw() {
            if (this.empty) {
                $(`<td rowspan=${this.row.length} colspan=${this.col.length}></td>`)
                    .data('width', 1).data('height', 1).data('vIndex', 1).appendTo(this.row.rows[0]);
                return this;
            }

            this.weeks.forEach(week => week.draw());

            return this;
        }
    }

    class TableWeek {
        /**
         * @param {array}   weekRaw Неделя
         * @param {object}  cell    Ячейка
         * @param {integer} pos     Номер недели
         */
        constructor(weekRaw, cell, pos) {
            this.cell = cell;
            this.pos = pos;

            if (!weekRaw) {
                this.empty = true;
                this.length = 1;
                return;
            }

            this.groups = weekRaw.map(groupRaw => new TableGroup(groupRaw, this));
            this.length = helpers.sum.apply(helpers, this.groups.map(group => group.length));
        }

        /**
         * Отрисовка недели
         * @return {TableWeek} this
         */
        draw() {
            this.rowSize = this.cell.row.length / this.cell.vLength * 2;
            this.colSize = this.cell.col.length / this.length;
            let rowPos = this.pos * this.rowSize;
            this.rows = [ this.cell.row.rows[rowPos], this.cell.row.rows[rowPos + 1] ];

            if (this.empty) {
                $(`<td rowspan=${this.rowSize} colspan=${this.colSize} class="cell-empty"></td>`)
                    .data('width', 1).data('height', this.pos === 0 ? this.cell.weeks.length : null).data('vIndex', this.pos)
                    .appendTo(this.rows[0]);
                return this;
            }

            let colPos = this.rows[0].children().length;
            this.groups.forEach(group => group.draw());
            this.rows[0].children().eq(colPos).data('width', this.groups.length)
                .data('height', this.pos === 0 ? this.cell.weeks.length : null).data('vIndex', this.pos);

            return this;
        }
    }

    class TableGroup {
        /**
         * @param {object} groupRaw Группа занятий
         * @param {object} week     Неделя
         */
        constructor(groupRaw, week) {
            this.week = week;

            if (!groupRaw) {
                this.empty = true;
                this.length = 1;
                return;
            }

            this.title = groupRaw.title;
            this.length = groupRaw.contents.length;
            this.contents = groupRaw.contents;
            this.lessonID = groupRaw.lessonID;
        }

        /**
         * Отрисвка группы занятий
         * @return {TableWeek} this
         */
        draw() {
            if (this.empty) {
                $(`<td rowspan=${this.week.rowSize} colspan=${this.week.colSize}></td>`).appendTo(this.week.rows[0]);
                return this;
            }

            let className = `lesson_${this.lessonID}`;

            if (this.length > 1) {
                $(`<td colspan=${this.week.colSize * this.length} class="cell-title ${className}">${this.title}</td>`).appendTo(this.week.rows[0]);
                this.contents.forEach(content => $(`<td rowspan=${this.week.rowSize - 1} colspan=${this.week.colSize} class="cell-content ${className}">${content}</td>`).appendTo(this.week.rows[1]));
            } else {
                $(`<td rowspan=${this.week.rowSize} colspan=${this.week.colSize} class="cell-full ${className}">${this.title}${this.contents[0]}</td>`).appendTo(this.week.rows[0]);
            }

            return this;
        }
    }

    window.Table = Table;
})();
