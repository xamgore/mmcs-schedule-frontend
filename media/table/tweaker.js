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
        this.$header = this.$block.children('thead');
        this.$body = this.$block.children('tbody');

        var width = xMath.sum.apply(xMath, this.$header.find('td').toArray().map(function (cell) {
            return cell.colSpan;
        }));
        var height = xMath.sum.apply(xMath, this.$body.find('td.time').toArray().map(function (cell) {
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

        this.$body.find('td').toArray().forEach(function (cell) {
            while (filled[data.posY][data.posX]) {
                data.posX++;
                if (data.posX >= width) {
                    data.posX = 0;
                    data.posY++;
                }
            }

            data.sizeX = Number(cell.colSpan);
            data.sizeY = Number(cell.rowSpan);
            data.size = $(cell).data('size');

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
            let $cells = this.$body.find('td');
            for (let cellsPos = 0, cellsLength = $cells.length; cellsPos < cellsLength; cellsPos++) {
                if ($cells[cellsPos] === null) continue;

                let current = new Cell(this.$block, $cells.eq(cellsPos));
                if (!current.$cells) continue;

                let next = new Cell(this.$block, Cell.findCell(this.$block, current.data.posX, current.data.posY + current.data.sizeY));
                if (!next.$cells || current.data.sizeX !== next.data.sizeX || current.html() !== next.html()) continue;

                next.$cells.toArray().forEach(next => $cells[$cells.index($(next))] = null);
                current.mergeVertical(next);

                cellsPos--;
            }
        },
        mergeHorisontal: function () {
            let $cells = this.$body.find('td');
            for (let cellsPos = 0, cellsLength = $cells.length; cellsPos < cellsLength; cellsPos++) {
                if ($cells[cellsPos] === null) continue;

                let current = new Cell(this.$block, $cells.eq(cellsPos));
                if (!current.$cells || !current.data.size) continue;
                let currents = [];
                for (let cellsOffset = 0, cellsLength = current.data.size; cellsOffset < cellsLength; cellsOffset++) {
                    let current = new Cell(this.$block, $cells.eq(cellsPos + cellsOffset));
                    currents.push(current);
                    if (current.$cells) cellsLength -= (current.$cells.length - 1 || 1) - 1;
                }

                if (current.data.size > 3) console.log(currents);

                let posXOffset = xMath.sum.apply(null, currents.map(current => current.data.sizeX));

                let next = new Cell(this.$block, Cell.findCell(this.$block, current.data.posX + posXOffset, current.data.posY));
                if (!next.$cells || current.data.size !== next.data.size) continue;
                let nexts = new Array(next.data.size);
                xMath.range(0, currents.length - 1).forEach(cellsOffset => {
                    let current = currents[cellsOffset];
                    nexts[cellsOffset] = new Cell(this.$block, Cell.findCell(this.$block, current.data.posX + posXOffset, current.data.posY));
                });
                if (xMath.range(0, currents.length - 1).some(cellsOffset => {
                    let current = currents[cellsOffset];
                    let next = nexts[cellsOffset];
                    return !next.$cells || current.data.sizeY !== next.data.sizeY || current.html() !== next.html();
                })) continue;

                console.log(currents, nexts);

                xMath.range(0, currents.length - 1).forEach(cellsOffset => {
                    let current = currents[cellsOffset];
                    let next = nexts[cellsOffset];
                    next.$cells.toArray().forEach(cell => $cells[$cells.index($(cell))] = null);
                    current.mergeHorisontal(next);
                });

                cellsPos--;
            }
        },
        fixWidth: function () {
            let $headerLines = this.$header.children();
            for (let row = 0, sz = $headerLines.length; row < sz; row++) {
                let $cells = $headerLines.eq(row).find('td');
                if (row != 0) {
                    $cells = $headerLines.first().children().first().add($cells);
                }

                let cols = $cells.toArray().map(cell => ({
                    length: $(cell).data('size') || 0,
                    width: 0
                }));
                let fullLength = xMath.sum.apply(xMath, cols.map(col => col.length));

                cols[0].width = 5;
                let widthPerCol = (100 - cols[0].width) / fullLength;
                cols.forEach(col => col.width = widthPerCol * col.length || col.width);

                cols.forEach((col, colID) => $cells.eq(colID).css('width', col.width + '%'));

                $cells.first().css('width', '50px');
                $cells.last().css('width', 'auto');
            }
        },
        setGroupsHeader: function () {
            let $areas = $('<tr><td rowspan="2"></td></tr>').prependTo(this.$header);
            let $cells = this.$header.children().eq(1).find('td');
            $cells.first().remove();

            $cells.toArray().forEach(cell => {
                let $cell = $(cell);
                let text = $cell.text();
                let [ full, group, area ] = /(.*?) \((.*?)\)/.exec(text) || [ text, text, '' ];

                let $lastArea = $areas.children().last();
                if ($lastArea.text() == area) {
                    let colspan = Number($lastArea.attr('colspan')) + Number($cell.attr('colspan')) || 0;
                    let size = $lastArea.data('size') + $cell.data('size');
                    $lastArea.attr('colspan', colspan).data('size', size);
                } else {
                    let colspan = Number($cell.attr('colspan')) || 0; 
                    let size = $cell.data('size');   
                    $(`<td colspan="${colspan}">${area}</td>`).data('size', size).appendTo($areas);
                }

                $cell.text(`${group} гр.`);
            });
        },
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

        if (!$cell) return;

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
                this.data.size = cellData.size;
                break;

            case 'title':
                this.$cells = $($cell);
                this.data.sizeX = cellData.sizeX;
                this.data.sizeY = cellData.sizeY;
                this.data.posX = cellData.posX;
                this.data.posY = cellData.posY;
                this.data.size = cellData.size;
                var sizeX = 0;
                while (sizeX !== this.data.sizeX) {
                    var $foundCell = Cell.findCell(this.$block, this.data.posX + sizeX, this.data.posY + 1);
                    var foundCellData = $foundCell.data();
                    sizeX += foundCellData.sizeX;
                    this.data.sizeY = 1 + foundCellData.sizeY;
                    this.$cells = this.$cells.add($foundCell);
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
        return this.$cells ? this.$cells.toArray().map(cell => $(cell).html()).join() : '';
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
