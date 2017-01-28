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

            function getType($cell) {
                if ($cell.hasClass('cell-title')) return 'title';
                if ($cell.hasClass('cell-content')) return 'content';
                if ($cell.hasClass('cell-full')) return 'full';
                if ($cell.hasClass('time')) return 'time';
                return 'empty';
            }

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
                    height: $(cellDOM).data('height'),
                    vIndex: $(cellDOM).data('vIndex'),
                    type: getType($(cellDOM)),
                    domClass: cellDOM.className,
                    html: $(cellDOM).html(),
                    deleted: false,
                };
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
                    class: cell.domClass,
                    colspan: cell.sizeX,
                    rowspan: cell.sizeY,
                }).html(cell.html).data('width', cell.width).data('height', cell.height)
                    .data('vIndex', cell.vIndex).appendTo($rows.eq(cell.posY));
            });
        }

        mergeBoths() {
            for (let i = 0, sz = this.cells.length; i < sz; i++) {
                let current = new Cell(this.cells, this.cells[i], true, true);
                if (!current.ok || current.empty) continue;

                let next = Cell.getBoth(this.cells, current.posX, current.posY + current.sizeY);
                if (!next.ok || current.sizeX !== next.sizeX || current.html() !== next.html()) continue;

                current.mergeVertical(next);

                i--;
            }
        }

        mergeWeeks() {
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

        mergeCellsVertical() {
            for (let i = 0, sz = this.cells.length; i < sz; i++) {
                let current = new Cell(this.cells, this.cells[i]);
                if (!current.ok || current.empty) continue;

                let both = Cell.getBoth(this.cells, current.posX, current.posY);
                let next = Cell.getCell(both.cells, current.posX, current.posY + current.sizeY);
                if (!next.ok || current.sizeX !== next.sizeX || current.html() !== next.html()) continue;

                current.mergeVertical(next);

                i--;
            }
        }

        mergeCellsHorisontal() {
            for (let i = 0, sz = this.cells.length; i < sz; i++) {
                let current = new Cell(this.cells, this.cells[i]);
                if (!current.ok || current.empty) continue;

                let week = Cell.getWeek(this.cells, current.posX, current.posY);
                let next = Cell.getCell(week.cells, current.posX + current.sizeX, current.posY);
                if (!next.ok || current.sizeY !== next.sizeY || current.html() !== next.html()) continue;

                current.mergeHorisontal(next);

                i--;
            }
        }

        deleteEmptySubgroups() {
            for (let i = 0, sz = this.cells.length; i < sz; i++) {
                let week = new Cell(this.cells, this.cells[i], true);
                if (!week.ok || week.empty) continue;

                let oldWidth = week.width;
                week.cells.forEach(wCell => {
                    if (!wCell || wCell.deleted) return;

                    if (wCell.type === 'empty') {
                        wCell.deleted = true;
                        week.length--;
                    }
                });

                week.width = week.length;
                week.cells.some(wCell => {
                    if (!wCell || wCell.deleted) return;

                    wCell.width = week.length;
                    return true;
                })

                let widthMul = oldWidth / week.width;
                let posX = week.posX;
                week.cells.forEach(wCell => {
                    if (!wCell || wCell.deleted) return;

                    wCell.sizeX *= widthMul;
                    wCell.posX = posX;

                    if (wCell.type !== 'title') posX += wCell.sizeX;
                });

                i += oldWidth - 1;
            };
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
            let $areaRow = $('<tr></tr>').insertAfter(this.$header.children().first());
            let $titles = this.$header.children().last().find('td');
            $titles.first().detach().attr('rowspan', 2).appendTo($areaRow);
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
                    $(`<td><span>${areaText}</span></td>`).attr('colspan', colspan).appendTo($areaRow);
                }

                $title.html(`<span>${titleText} гр.</span>`);
            });
        }

        blurWeeks(pos, length) {
            this.cells.forEach(cell => {
                let both = new Cell(this.cells, cell, true, true);
                if (!both.ok || both.height !== length) return;

                both.cells.forEach(cell => {
                    let week = new Cell(both.cells, cell, true);
                    if (!week.ok || week.vIndex == pos) return;

                    week.cells.forEach(cell => cell.domClass += ' cell-blured');
                });
            });
        }
    }

    class Cell {
        constructor(cells, cell, week, both) {
            this.ok = false;

            if (!cell || cell.deleted) return;

            this.cells = null;
            this.posX = cell.posX;
            this.posY = cell.posY;
            this.sizeX = cell.sizeX;
            this.sizeY = cell.sizeY;
            this.width = cell.width;
            this.height = cell.height;
            this.vIndex = cell.vIndex;
            this.length = 0;
            this.isWeek = Boolean(this.width);
            this.isBoth = Boolean(this.height);
            this.empty = false;

            if (week && !this.isWeek) return;
            if (both && !this.isBoth) return;

            switch (cell.type) {
                case 'full':
                    this.cells = [ cell ];
                    this.length = 1;
                    break;

                case 'title':
                    this.cells = [ cell ];
                    let offsetX = 0;
                    while (offsetX < this.sizeX) {
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
                while (this.length < this.width) {
                    let [ posX, posY ] = [ this.posX + this.sizeX, this.posY ];
                    let fCell = Cell.getCell(cells, posX, posY, true);
                    if (fCell.posX === posX && fCell.posY === posY) {
                        this.cells = this.cells.concat(fCell.cells);
                        if (this.empty) this.empty = fCell.empty;
                    }
                    this.sizeX += fCell.sizeX;
                    this.length += fCell.length;
                }
            }

            if (both) {
                for (let i = 1; i < this.height; i++) {
                    let [ posX, posY ] = [ this.posX, this.posY + this.sizeY ];
                    let fCell = Cell.getWeek(cells, posX, posY);
                    if (fCell.posX === posX && fCell.posY === posY) {
                        this.cells = this.cells.concat(fCell.cells);
                        if (this.empty) this.empty = fCell.empty;
                    }
                    this.sizeY += fCell.sizeY;
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
            if (this.isBoth && !next.isBoth) this.height = this.cells[0].height -= 1;
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
            if (this.isWeek && !next.isWeek) this.width = this.cells[0].width -= next.length;
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
                if (cell.ok && x >= cell.posX && x < cell.posX + cell.sizeX && y >= cell.posY && y < cell.posY + cell.sizeY) {
                    fCell = cell;
                    return true;
                }
            });
            return fCell;
        }

        static getBoth(cells, x, y) {
            let fCell = new Cell(cells, null);
            cells.some(cellData => {
                let cell = new Cell(cells, cellData, true, true);
                if (cell.ok && x >= cell.posX && x < cell.posX + cell.sizeX && y >= cell.posY && y < cell.posY + cell.sizeY) {
                    fCell = cell;
                    return true;
                }
            });
            return fCell;
        }
    }

    window.TableTweaker = TableTweaker;
})();
