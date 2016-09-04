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

        this.$header = this.$block.children('thead');
        this.$body = this.$block.children('tbody');
    };

    /**
     * Применить твики рендера
     */
    TableTweaker.prototype.apply = function () {
        this.tweaksList.forEach(function (tweak) {
            this.tweaks[tweak].call(this);
        }, this);
    };

    /**
     * Твики рендера
     */
    TableTweaker.prototype.tweaks = {
        setData: function () {
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
        },
        mergeVertical: function () {
            var findCell = this.tweaks.helpers.findCell.bind(this);

            var $body = this.$block.children('tbody');
            var $cells = $body.find('td');
            for (var cellsPos = 0, cellsSz = $cells.length; cellsPos < cellsSz; cellsPos++) {
                if ($cells[cellsPos] === null) {
                    continue;
                }

                var $cell = $cells.eq(cellsPos);
                var cellData = $cell.data();
                if (cellData.type !== 'full') {
                    continue;
                }

                var $next = findCell(cellData.posX, cellData.posY + cellData.sizeY);
                if (!$next) {
                    continue;
                }
                var nextData = $next.data();
                if (nextData.type !== 'full' || cellData.sizeX !== nextData.sizeX || $cell.html() !== $next.html()) {
                    continue;
                }

                cellData.sizeY += nextData.sizeY;
                $cell.data(cellData);
                $cell.attr('rowspan', cellData.sizeY);

                $cells[$cells.index($next)] = null;
                $next.remove();

                cellsPos--;
            }
        },
        mergeHorisontal: function () {
            var findCell = this.tweaks.helpers.findCell.bind(this);

            var $body = this.$block.children('tbody');
            var $cells = $body.find('td');
            for (var cellsPos = 0, cellsSz = $cells.length; cellsPos < cellsSz; cellsPos++) {
                if ($cells[cellsPos] === null) {
                    continue;
                }

                var $cell = $cells.eq(cellsPos);
                var cellData = $cell.data();
                if (cellData.type !== 'full') {
                    continue;
                }

                var $next = findCell(cellData.posX + cellData.sizeX, cellData.posY);
                if (!$next) {
                    continue;
                }
                var nextData = $next.data();
                if (nextData.type !== 'full' || cellData.sizeY !== nextData.sizeY || $cell.html() !== $next.html()) {
                    continue;
                }

                cellData.sizeX += nextData.sizeX;
                $cell.data(cellData);
                $cell.attr('colspan', cellData.sizeX);

                $cells[$cells.index($next)] = null;
                $next.remove();

                cellsPos--;
            }
        },
        fixWidth: function () {
            var $cells = this.$header.find('td');
            var cols = $cells.toArray().map(function (cell) {
                return {
                    length: $(cell).data('size') || 0,
                    width: 0
                };
            });
            var fullLength = xMath.sum.apply(xMath, cols.map(function (col) {
                return col.length;
            }));

            cols[0].width = 4;
            var widthPerCol = (100 - cols[0].width) / fullLength;
            cols.forEach(function (col) {
                col.width = widthPerCol * col.length || col.width;
            });

            cols.forEach(function (col, colID) {
                $cells.eq(colID).css('width', col.width + '%');
            });
        },
        helpers: {
            findCell: function (posX, posY) {
                var $res = null;
                var $body = this.$block.children('tbody');
                $body.find('td').toArray().some(function (cell) {
                    var $cell = $(cell);
                    var cellData = $cell.data();
                    if (cellData.posX === posX && cellData.posY === posY) {
                        $res = $cell;
                        return true;
                    }
                });
                return $res;
            }
        }
    };
})();
