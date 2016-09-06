/* globals helpers, xMath */
(function () {
    'use strict';

    /**
     * Конструктор класса TableTweaker
     * @param {jQuery} $block     объект таблицы
     * @param {array}  tweaksList список применяемых твиков
     */
    var TableTweaker = window.TableTweaker = function ($block, tweaksList) {
        this.$block = $block;
        this.tweaksList = tweaksList;

        this.setData();
    };

    /**
     * Заполнение данных в таблице для корректной работы твиков
     * @return {TableTweaker} this
     */
    TableTweaker.prototype.setData = function () {
        var $header = this.$block.children('thead');
        var $body = this.$block.children('tbody');

        var width = xMath.sum.apply(xMath, $header.find('td').toArray().map(function (cell) {
            return cell.colSpan;
        }));
        var height = xMath.sum.apply(xMath, $body.find('td.time').toArray().map(function (cell) {
            return cell.rowSpan;
        }));

        var filled = new Array(height);
        for (var i = 0, sz = filled.length; i < sz; i++) {
            filled[i] = new Array(width);
            helpers.array.fill(filled[i], false);
        }

        var data = {
            sizeX: 0,
            sizeY: 0,
            posX: 0,
            posY: 0,
            type: 'empty'
        };

        $body.find('td').toArray().forEach(function (cell) {
            while (filled[data.posY][data.posX]) {
                data.posX++;
                if (data.posX >= width) {
                    data.posX = 0;
                    data.posY++;
                }
            }

            data.sizeX = Number(cell.colSpan);
            data.sizeY = Number(cell.rowSpan);

            switch (cell.className) {
                case 'cell-title':
                    data.type = 'title';
                    break;

                case 'cell-content':
                    data.type = 'content';
                    break;

                case 'cell-full':
                    data.type = 'full';
                    break;

                case 'time':
                    data.type = 'time';
                    break;

                default:
                    data.type = 'empty';
            }

            $(cell).data(data);

            for (var y = 0; y < data.sizeY; y++) {
                for (var x = 0; x < data.sizeX; x++) {
                    filled[data.posY + y][data.posX + x] = true;
                }
            }
        });
    };


    /**
     * Применить твики рендера
     * @return {TableTweaker} this
     */
    TableTweaker.prototype.apply = function () {
        this.tweaksList.forEach(function (tweak) {
            this.tweaks[tweak].call(this);
        }, this);

        return this;
    };

    /**
     * Твики рендера
     */
    TableTweaker.prototype.tweaks = {
        mergeVertical: function () {
            var $body = this.$block.children('tbody');
            var $cells = $body.find('td');
            for (var cellsPos = 0, cellsSz = $cells.length; cellsPos < cellsSz; cellsPos++) {
                if ($cells[cellsPos] === null) {
                    continue;
                }

                var cell = new Cell(this.$block, $cells.eq(cellsPos));
                if (!cell.$cells) {
                    continue;
                }

                var $next = Cell.findCell(this.$block, cell.data.posX, cell.data.posY + cell.data.sizeY);
                if (!$next) {
                    continue;
                }
                var next = new Cell(this.$block, $next);
                if (!next.$cells || cell.data.sizeX !== next.data.sizeX || cell.html() !== next.html()) {
                    continue;
                }

                for (var i = 0, sz = next.$cells.length; i < sz; i++) {
                    $cells[$cells.index(next.$cells.eq(i))] = null;
                }
                cell.mergeVertical(next);

                cellsPos--;
            }
        },
        mergeHorisontal: function () {
            var $body = this.$block.children('tbody');
            var $cells = $body.find('td');
            for (var cellsPos = 0, cellsSz = $cells.length; cellsPos < cellsSz; cellsPos++) {
                if ($cells[cellsPos] === null) {
                    continue;
                }

                var cell = new Cell(this.$block, $cells.eq(cellsPos));
                if (!cell.$cells) {
                    continue;
                }

                var $next = Cell.findCell(this.$block, cell.data.posX + cell.data.sizeX, cell.data.posY);
                if (!$next) {
                    continue;
                }
                var next = new Cell(this.$block, $next);
                if (!next.$cells || cell.data.sizeY !== next.data.sizeY || cell.html() !== next.html()) {
                    continue;
                }

                for (var i = 0, sz = next.$cells.length; i < sz; i++) {
                    $cells[$cells.index(next.$cells.eq(i))] = null;
                }
                cell.mergeHorisontal(next);

                cellsPos--;
            }
        },
        fixWidth: function () {
            var $header = this.$block.children('thead');
            var $cells = $header.find('td');
            var cols = $cells.toArray().map(function (cell) {
                return {
                    length: $(cell).data('size') || 0,
                    width: 0
                };
            });
            var fullLength = xMath.sum.apply(xMath, cols.map(function (col) {
                return col.length;
            }));

            cols[0].width = 5;
            var widthPerCol = (100 - cols[0].width) / fullLength;
            cols.forEach(function (col) {
                col.width = widthPerCol * col.length || col.width;
            });

            cols.forEach(function (col, colID) {
                $cells.eq(colID).css('width', col.width + '%');
            });

            $cells.first().css('width', '50px');
            $cells.last().css('width', 'auto');
        }
    };


    /**
     * Конструктор класса Cell
     * @param {jQuery} $block блок таблицы
     * @param {jQuery} $cell  ячейка
     */
    var Cell = function ($block, $cell) {
        this.$block = $block;
        this.$cells = null;
        this.data = {
            sizeX: 0,
            sizeY: 0,
            posX: 0,
            posY: 0
        };

        this.build($cell);
    };

    /**
     * Поиск ячейки по заданным координатам
     * @param  {jQuery} $block блок таблицы
     * @param  {int}    posX   позиция по OX
     * @param  {int}    posY   позиция по OY
     * @return {jQuery}        найденная ячейка или null
     */
    Cell.findCell = function ($block, posX, posY) {
        var $res = null;
        var $body = $block.children('tbody');
        $body.find('td').toArray().some(function (cell) {
            var $cell = $(cell);
            var cellData = $cell.data();
            if (cellData.posX === posX && cellData.posY === posY) {
                $res = $cell;
                return true;
            }
        });
        return $res;
    };

    /**
     * Построение ячейки по начальной
     * @param  {jQuery} $cell блок ячейки
     * @return {Cell}         this
     */
    Cell.prototype.build = function ($cell) {
        var cellData = $cell.data();
        switch(cellData.type) {
            case 'full':
                this.$cells = $($cell);
                this.data.sizeX = cellData.sizeX;
                this.data.sizeY = cellData.sizeY;
                this.data.posX = cellData.posX;
                this.data.posY = cellData.posY;
                break;

            case 'title':
                this.$cells = $($cell);
                this.data.sizeX = cellData.sizeX;
                this.data.sizeY = cellData.sizeY;
                this.data.posX = cellData.posX;
                this.data.posY = cellData.posY;
                var sizeX = 0;
                while (sizeX !== this.data.sizeX) {
                    var $fndCell = Cell.findCell(this.$block, this.data.posX + sizeX, this.data.posY + 1);
                    var fndCellData = $fndCell.data();
                    sizeX += fndCellData.sizeX;
                    this.data.sizeY = 1 + fndCellData.sizeY;
                    this.$cells = this.$cells.add($fndCell);
                }
                break;
        }

        return this;
    };

    /**
     * Получить html ячейки
     * @return {string} html ячейки
     */
    Cell.prototype.html = function () {
        if (this.$cells) {
            return this.$cells.toArray().map(function (cell) {
                return $(cell).html();
            }).join();
        }

        return '';
    };

    /**
     * Объединить ячейку с переданной (по вертикали)
     * @param  {Cell} next заменяемая ячейка
     * @return {Cell}      this
     */
    Cell.prototype.mergeVertical = function (next) {
        for (var i = 0, sz = this.$cells.length; i < sz; i++) {
            if (i === 0 && sz !== 1) {
                continue;
            }

            var $cell = this.$cells.eq(i);
            var $next = next.$cells.eq(i);

            var cellData = $cell.data();
            var nextData = $next.data();

            cellData.sizeY += (sz !== 1 ? 1 : 0) + nextData.sizeY;
            $cell.data(cellData);
            $cell.attr('rowspan', cellData.sizeY);
        }

        this.data.sizeY += next.data.sizeY;
        next.$cells.remove();

        return this;
    };

    /**
     * Объединить ячейку с переданной (по горизонтали)
     * @param  {Cell} next заменяемая ячейка
     * @return {Cell}      this
     */
    Cell.prototype.mergeHorisontal = function (next) {
        var nextPosXInc = 0;
        for (var i = 0, sz = this.$cells.length; i < sz; i++) {
            var $cell = this.$cells.eq(i);
            var $next = next.$cells.eq(i);

            var cellData = $cell.data();
            var nextData = $next.data();

            if (i !== 0) {
                cellData.posX += nextPosXInc;
                nextPosXInc += nextData.sizeX;
            }
            cellData.sizeX += nextData.sizeX;
            $cell.data(cellData);
            $cell.attr('colspan', cellData.sizeX);
        }

        this.data.sizeX += next.data.sizeX;
        next.$cells.remove();

        return this;
    };
})();
