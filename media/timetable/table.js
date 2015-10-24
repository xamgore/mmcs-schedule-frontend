var Table = (function() {
    'use strict';

    // Получение параметров строк
    var getRowsInfo = function (data) {
        // Получение размеров строки
        var countRowRows = function (data, pos) {
            var row = [];

            for (var i = 0; i < data[pos].length; i++) {
                var cell = data[pos][i];

                if (cell && cell.length) {
                    row.push(cell.length);
                }
            }

            return row;
        };

        // Получение списка размеров строк
        var countRows = function (data) {
            var rows = new Array(data.length);

            for (var i = 0; i < rows.length; i++) {
                rows[i] = countRowRows(data, i)
            }

            return rows;
        };

        return countRows(data).map(function (row) {
            var length = row.length ? xMath.lcm.apply(xMath, row) * 2 : 2;
            var count = row.length ? Math.max.apply(Math, row) : 1;

            return {
                length: length,
                count: count
            };
        });
    };

    // Подсчет сколонок в строке недели
    var countWeekCols = function (week) {
        if (!(week && week.length)) {
            return 0;
        }

        var count = 0;
        for (var i = 0; i < week.length; i++) {
            var group = week[i];

            count += group ? group.contents.length : 1;
        }

        return count;
    };

    // Получение параметров колонок
    var getColsInfo = function (data) {
        // Получение размеров колонки
        var countColCols = function (data, pos) {
            var col = [];

            for (var i = 0; i < data.length; i++) {
                var cell = data[i][pos];

                if (!cell) {
                    continue;
                }

                for (var j = 0; j < cell.length; j++) {
                    var count = countWeekCols(cell[j]);
                    if (count) {
                        col.push(count);
                    }
                }
            }

            return col;
        };

        // Получение списка размеров колонок
        var countCols = function (data) {
            var cols = new Array(data[0].length);

            for (var i = 0; i < cols.length; i++) {
                cols[i] = countColCols(data, i);
            }

            return cols;
        };

        var fullWidth = 0;

        var cols = countCols(data).map(function (col) {
            var length = col.length ? xMath.lcm.apply(xMath, col) : 1;
            var count = col.length ? Math.max.apply(Math, col) : 1;
            var width = col.length ? Math.sqrt(count) : 0.5;

            fullWidth += width;

            return {
                length: length,
                count: count,
                width: width
            };
        });

        cols.forEach(function (col) {
            col.width /= fullWidth;
        });

        return cols;
    };

    // Построение таблицы
    var buildTable = function ($block, data, times, title, rows, cols) {
        // Создание заголовка таблицы
        var createHeader = function ($block, title, cols) {
            var $header = $('<thead></thead>').appendTo($block);

            var $colSizes = $('<tr class="service"></tr>').prependTo($header);
            $('<td></td>').appendTo($colSizes);
            cols.forEach(function (col) {
                for (var i = 0; i < col.length; i++) {
                    $('<td></td>').appendTo($colSizes);
                }
            });
            var $control = $colSizes.children();

            var $headerLine = $('<tr><td></td></tr>').appendTo($header);
            title.forEach(function (columnTitle, i) {
                $('<td colspan=' + cols[i].length + ' class="title">' + columnTitle + '</td>').appendTo($headerLine);
            });

            return $control;
        };

        // Создание тела таблицы
        var createBody = function ($block) {
            var $table = $('<tbody></tbody>').appendTo($block);
            return $table;
        };

        /**
         * Создание строк таблицы
         * @return [jQuery]
         */
        var createRowLines = function ($table, i, rowInfo, times) {
            var lines = new Array(rowInfo.length);
            for (var j = 0; j < lines.length; j++) {
                lines[j] = $('<tr></tr>').appendTo($table);
            }

            $('<td rowspan=' + rowInfo.length + ' class="time">' + times[i] + '</td>').appendTo(lines[0]);

            return lines;
        };

        // Заполнение группы
        var fillGroup = function (lines, group, rowSize, colSize, weekId) {
            if (!group) {
                $('<td rowspan=' + rowSize + ' colspan=' + colSize + '></td>').appendTo(lines[weekId * rowSize]);
                return;
            }

            if (group.contents.length === 1) {
                $('<td rowspan=' + rowSize / 2 + ' colspan=' + colSize * group.contents.length + ' class="sub-cell-title">' + group.title + '</td>').appendTo(lines[weekId * rowSize]);
                var subCell = group.contents[0];
                $('<td rowspan=' + rowSize / 2 + ' colspan=' + colSize + ' class="sub-cell-content">' + subCell + '</td>').appendTo(lines[weekId * rowSize + rowSize / 2]);
            } else {
                $('<td colspan=' + colSize * group.contents.length + ' class="sub-cell-title multi">' + group.title + '</td>').appendTo(lines[weekId * rowSize]);
                for (var i = 0; i < group.contents.length; i++) {
                    var subCell = group.contents[i];

                    $('<td rowspan=' + (rowSize - 1) + ' colspan=' + colSize + ' class="sub-cell-content multi">' + subCell + '</td>').appendTo(lines[weekId * rowSize + 1]);
                }
            }
        }

        // Заполенние ячейки
        var fillCell = function (lines, cell, rowInfo, colInfo) {
            if (!cell) {
                $('<td rowspan=' + rowInfo.length + ' colspan=' + colInfo.length + '></td>').appendTo(lines[0]);
                return;
            }

            var rowSize = rowInfo.length / cell.length;

            for (var i = 0; i < cell.length; i++) {
                var week = cell[i];

                if (!week) {
                    $('<td rowspan=' + rowSize + ' colspan=' + colInfo.length + '></td>').appendTo(lines[i * rowSize]);
                    continue;
                }

                var colSize = colInfo.length / countWeekCols(week);

                for (var j = 0; j < week.length; j++) {
                    fillGroup(lines, week[j], rowSize, colSize, i);
                }
            }
        }

        // Заполнение таблицы
        var fillTable = function ($table, data, times, cols, rows) {
            for (var i = 0; i < data.length; i++) {
                var rowInfo = rows[i];

                // Добавление строк
                var lines = createRowLines($table, i, rowInfo, times);

                for (var j = 0; j < data[i].length; j++) {
                    fillCell(lines, data[i][j], rowInfo, cols[j]);
                }
            }
        };

        // Оистка таблицы
        $block.html('');

        // Создание заголовка таблицы
        var $control = createHeader($block, title, cols);

        // Создание tbody
        var $table = createBody($block);

        // Заполнение таблицы
        fillTable($table, data, times, cols, rows);

        return {
            $block: $block,
            $control: $control,
            $table: $table
        }
    }

    var beautify = function (table, cols) {
        var timeWidth = 42;
        table.$control.first().width(timeWidth);
        var colMaxWidth = table.$block.width() - timeWidth;
        var c = 1;
        cols.forEach(function (col) {
            var width = colMaxWidth * col.width / col.length;
            for (var i = 0; i < col.length; i++, c++) {
                table.$control.eq(c).width(width);
            }
        });

        table.$table.find('td').each(function () {
            var $cell = $(this);
            var $full = $cell.find('.full');
            var $short = $cell.find('.short');

            if ($cell.width() >= 180) {
                $full.show();
                $short.hide();
            } else {
                $full.hide();
                $short.show();
            }
        });
    }

    var Table = function($block, data, times, title) {
        var rows = getRowsInfo(data);
        var cols = getColsInfo(data);

        var table = buildTable($block, data, times, title, rows, cols);

        beautify(table, cols);
    };

    return Table;
})();
