/* globals helpers, xMath */
(function () {
    'use strict';

    class TableTweaker {
        constructor($table) {
            this.$table = $table;
            this.$header = this.$table.children('thead');
            this.$body = this.$table.children('tbody');

            this.width = xMath.sum.apply(xMath, this.$header.find('td').toArray().map(cell => cell.colSpan));
            this.height = xMath.sum.apply(xMath, this.$body.find('td.time').toArray().map(cell => cell.rowSpan));

            let filled = new Array(this.height);
            xMath.range(0, this.height).forEach(i => {
                filled[i] = new Array(this.width).fill(false);
            });

            let types = {
                'cell-title':   'title',
                'cell-content': 'content',
                'cell-full':    'full',
                'time':         'time',
            };

            let [ posX, posY ] = [ 0, 0 ];

            this.cells = [];
            let $cells = this.$body.find('td');
            $cells.toArray().forEach(cellDOM => {
                while (filled[posY][posX]) {
                    posX++;
                    if (posX >= this.width) {
                        posX = 0;
                        posY++;
                    }
                }

                let cell = {
                    posX: posX,
                    posY: posY,
                    sizeX: cellDOM.colSpan,
                    sizeY: cellDOM.rowSpan,
                    width: $(cellDOM).data('width'),
                    type: types[cellDOM.className] || 'empty',
                    className: cellDOM.className,
                    html: $(cellDOM).html(),
                    deleted: false,
                }
                this.cells.push(cell);

                let xRange = xMath.range(cell.posX, cell.posX + cell.sizeX);
                let yRange = xMath.range(cell.posY, cell.posY + cell.sizeY);
                xRange.forEach(x => yRange.forEach(y => filled[y][x] = true));
            });

            $cells.remove();
        }

        draw() {
            let $rows = this.$body.children();
            this.cells.forEach(cell => {
                if (cell.deleted) return;

                let $cell = $('<td></td>').attr({
                    class: cell.className,
                    colspan: cell.sizeX,
                    rowspan: cell.sizeY
                }).html(cell.html).appendTo($rows.eq(cell.posY));

                if (cell.width) $cell.data('width', cell.width);
            });
        }

        mergeVertical() {
            for (let i = 0, sz = this.cells.length; i < sz; i++) {
                let current = new Cell(this.cells, this.cells[i]);
                if (!current.ok || current.empty) continue;

                let next = Cell.getCell(this.cells, current.posX, current.posY + current.sizeY);
                if (!next.ok || current.sizeX !== next.sizeX || current.html() !== next.html()) continue;

                current.mergeVertical(next);

                i--;
            }
        }

        mergeHorisontal() {
            let dividers = new Array(this.cells.length).fill(1);
            for (let i = 0, sz = this.cells.length; i < sz; i++) {
                let current = new Cell(this.cells, this.cells[i], true);
                if (!current.ok || current.empty) continue;

                let next = Cell.getWeek(this.cells, current.posX + current.sizeX, current.posY);
                if (!next.ok || current.sizeY !== next.sizeY || current.html() !== next.html()) continue;

                current.mergeHorisontal(next);

                dividers[i]++;
                current.cells[0].divider = dividers[i];

                i--;
            }
        }

        fixWidth() {
            let $headerCells = this.$header.find('td');
            let $titles = $headerCells.slice(1);

            let x = 1;
            let yRange = xMath.range(0, this.height);
            let titles = $titles.toArray().map(title => {
                let length = Math.max.apply(Math, yRange.map(y => {
                    let week = Cell.getWeek(this.cells, x, y);
                    if (!week.ok) return 0;
                    let divider = week.cells[0].divider || 1;
                    return week.width / divider;
                })) || 1;
                let colspan = Number($(title).attr('colspan'))
                x += colspan;
                return { length, colspan };
            });

            let fullLength = xMath.sum.apply(xMath, titles.map(({ length }) => length));
            let timeWidth = 5;
            let widthPerCol = (100 - timeWidth) / fullLength;

            let $fixWidthRow = $('<tr class="service"><td></td></tr>').prependTo(this.$header);
            titles.forEach(({ length, colspan }) => {
                $(`<td></td>`).css('width', `${widthPerCol * length}%`).attr("colspan", colspan).appendTo($fixWidthRow)
            });
            $fixWidthRow.children().first().css('width', '50px');
            $fixWidthRow.children().last().css('width', 'auto');
        }

        setGroupsHeader() {
            let $areaRow = $('<tr><td rowspan=2></td></tr>').insertAfter(this.$header.children().first());
            let $titles = this.$header.children().last().find('td');
            $titles.first().remove();
            $titles = $titles.slice(1);

            $titles.toArray().forEach(title => {
                let $title = $(title);
                let text = $title.text();
                let [ fullText, titleText, areaText ] = /(.*?) \((.*?)\)/.exec(text) || [ text, text, '' ];

                let $lastArea = $areaRow.children().last();
                if ($areaRow.children().length > 1 && $lastArea.text() === areaText) {
                    let colspan = Number($lastArea.attr('colspan')) + Number($title.attr('colspan')) || 0;
                    $lastArea.attr('colspan', colspan);
                } else {
                    let colspan = Number($title.attr('colspan')) || 0;
                    $(`<td>${areaText}</td>`).attr('colspan', colspan).appendTo($areaRow);
                }

                $title.text(`${titleText} гр.`);
            });
        }
    }

    class Cell {
        constructor(cells, cell, week) {
            if (!cell || cell.deleted) return;

            this.cells = null;
            this.posX = cell.posX;
            this.posY = cell.posY;
            this.sizeX = cell.sizeX;
            this.sizeY = cell.sizeY;
            this.width = cell.width;
            this.length = 0;
            this.isWeek = Boolean(this.width);
            this.empty = false;
            this.ok = false;

            if (week && !this.isWeek) return;

            switch (cell.type) {
                case 'full':
                    this.cells = [ cell ];
                    this.length = 1;
                    break;

                case 'title':
                    this.cells = [ cell ];
                    for (let offsetX = 0; offsetX < this.sizeX; ) {
                        let fCell = Cell.findCell(cells, this.posX + offsetX, this.posY + 1);
                        this.cells.push(fCell);

                        offsetX += fCell.sizeX;
                        this.sizeY = 1 + fCell.sizeY;

                        this.length++;
                    }
                    break;

                case 'empty':
                    this.cells = [ cell ];
                    this.length = 1;
                    this.empty = true;
                    break;

                default:
                    return;
            }

            if (week) {
                for (let i = this.length, sz = this.width; i < sz; ) {
                    let [ posX, posY ] = [ this.posX + this.sizeX, this.posY ];
                    let fCell = Cell.getCell(cells, posX, posY, true);
                    if (fCell.posX === posX && fCell.posY === posY) {
                        [].push.apply(this.cells, fCell.cells);
                    }
                    this.sizeX += fCell.sizeX;
                    this.empty = this.empty || fCell.empty;
                    i += fCell.length;
                }
            }

            this.ok = true;
        }

        html() {
            return this.ok ? this.cells.map(cell => cell.html).join('\n') : '';
        }

        mergeVertical(next) {
            xMath.range(0, this.cells.length).forEach(i => {
                let tData = this.cells[i];
                let nData = next.cells[i];

                if (tData.type === 'title') return;

                tData.sizeY += nData.sizeY;
                if (tData.type === 'content') tData.sizeY++;
            });

            this.sizeY += next.sizeY;
            next.cells.forEach(cell => cell.deleted = true);
        }

        mergeHorisontal(next) {
            let offsetX = this.posX;
            xMath.range(0, this.cells.length).forEach(i => {
                let tData = this.cells[i];
                let nData = next.cells[i];

                tData.posX = offsetX;
                tData.sizeX += nData.sizeX;

                if (tData.type !== 'title') offsetX = tData.posX + tData.sizeX;
            });

            this.sizeX += next.sizeX;
            next.cells.forEach(cell => cell.deleted = true);
        }

        static findCell(cells, x, y, inCell) {
            let fCell = null;
            cells.some(cell => {
                if (!cell) return false;

                if (
                    !inCell && cell.posX === x && cell.posY === y ||
                    inCell && x >= cell.posX && x < cell.posX + cell.sizeX && y >= cell.posY && y < cell.posY + cell.sizeY
                ) {
                    fCell = cell;
                    return true;
                }
            });
            return fCell;
        }

        static getCell(cells, x, y, inCell) {
            return new Cell(cells, Cell.findCell(cells, x, y, inCell));
        }

        static getWeek(cells, x, y) {
            let fCell = new Cell(cells, null);
            cells.some(cellData => {
                let cell = new Cell(cells, cellData, true);
                if (cell.ok && x >= cell.posX && x < cell.posX + cell.sizeX && cell.posY === y) {
                    fCell = cell;
                    return true;
                }
            });
            return fCell;
        }
    }

    window.TableTweaker = TableTweaker;
})();
