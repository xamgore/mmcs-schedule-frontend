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
            xMath.range(0, this.height - 1).forEach(i => {
                filled[i] = new Array(this.width);
                helpers.array.fill(filled[i], false);
            });

            let types = {
                'cell-title':   'title',
                'cell-content': 'content',
                'cell-full':    'full',
                'time':         'time',
            };

            let [ posX, posY ] = [ 0, 0 ];

            let $cells = this.$body.find('td');
            $cells.toArray().forEach(cell => {
                while (filled[posY][posX]) {
                    posX++;
                    if (posX >= this.width) {
                        posX = 0;
                        posY++;
                    }
                }
                let [ sizeX, sizeY ] = [ cell.colSpan, cell.rowSpan ];
                let width = $(cell).data('width');
                let type = types[cell.className] || 'empty';

                $(cell).data({ posX, posY, sizeX, sizeY, width, type });

                let xRange = xMath.range(posX, posX + sizeX - 1);
                let yRange = xMath.range(posY, posY + sizeY - 1);
                xRange.forEach(x => yRange.forEach(y => filled[y][x] = true));
            });
        }

        mergeVertical() {
            let $cells = this.$body.find('td');
            for (let i = 0, sz = $cells.length; i < sz; i++) {
                if (!$cells[i]) continue;

                let current = new Cell(this.$table, $cells.eq(i));
                if (!current.ok || current.empty) continue;

                let next = Cell.getCell(this.$table, current.posX, current.posY + current.sizeY);
                if (!next.ok || current.sizeX !== next.sizeX || current.html() !== next.html()) continue;

                next.cells.forEach(next => $cells[$cells.index($(next))] = null);
                current.mergeVertical(next);

                i--;
            }
        }

        mergeHorisontal() {
            let $cells = this.$body.find('td');
            let dividers = new Array($cells.length);
            helpers.array.fill(dividers, 1);
            for (let i = 0, sz = $cells.length; i < sz; i++) {
                if (!$cells[i]) continue;

                let current = new Cell(this.$table, $cells.eq(i), true);
                if (!current.ok || current.empty) continue;

                let next = Cell.getWeek(this.$table, current.posX + current.sizeX, current.posY);
                if (!next.ok || current.sizeY !== next.sizeY || current.html() !== next.html()) continue;

                next.cells.forEach(next => $cells[$cells.index($(next))] = null);
                current.mergeHorisontal(next);

                dividers[i]++;
                current.cells[0].data('divider', dividers[i]);

                i--;
            }
        }

        fixWidth() {
            let $headerCells = this.$header.find('td');
            let $titles = $headerCells.slice(1);

            let x = 1;
            let yRange = xMath.range(0, this.height - 1);
            let titles = $titles.toArray().map(title => {
                let length = Math.max.apply(Math, yRange.map(y => {
                    let week = Cell.getWeek(this.$table, x, y);
                    if (!week.ok) return 0;
                    let divider = Number(week.cells[0].data('divider')) || 1;
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
        constructor($table, $cell, week) {
            if (!$cell) return;

            let data = $cell.data();

            this.cells = null;
            this.posX = data.posX;
            this.posY = data.posY;
            this.sizeX = data.sizeX;
            this.sizeY = data.sizeY;
            this.width = data.width;
            this.length = 0;
            this.isWeek = Boolean(this.width);
            this.empty = false;
            this.ok = false;

            if (week && !this.isWeek) return;

            switch (data.type) {
                case 'full':
                    this.cells = [ $cell ];
                    this.length = 1;
                    break;

                case 'title':
                    this.cells = [ $cell ];
                    for (let offsetX = 0; offsetX < this.sizeX; ) {
                        let $cell = Cell.findCell($table, this.posX + offsetX, this.posY + 1);
                        this.cells.push($cell);

                        let { sizeX, sizeY } = $cell.data();
                        offsetX += sizeX;
                        this.sizeY = 1 + sizeY;

                        this.length++;
                    }
                    break;

                case 'empty':
                    this.cells = [ $cell ];
                    this.length = 1;
                    this.empty = true;
                    break;

                default:
                    return;
            }

            if (week) {
                for (let i = this.length, sz = this.width; i < sz; ) {
                    let next = Cell.getCell($table, this.posX + this.sizeX, this.posY);
                    [].push.apply(this.cells, next.cells);
                    this.sizeX += next.sizeX;
                    if (this.empty) this.empty = next.empty;
                    i += next.length;
                }
            }

            this.ok = true;
        }

        html() {
            return this.ok ? this.cells.map(cell => $(cell).html()).join('\n') : '';
        }

        mergeVertical(next) {
            let size = this.cells.length;
            xMath.range(0, size - 1).forEach(i => {
                let $this = this.cells[i]
                let $next = next.cells[i]

                if ($this.data('type') === 'title') return;

                let tData = $this.data();
                let nData = $next.data();

                tData.sizeY += ($this.data('type') === 'content' ? 1 : 0) + nData.sizeY;
                $this.data(tData).attr('rowspan', tData.sizeY);
            });

            this.sizeY += next.sizeY;
            next.cells.forEach($cell => $cell.remove());
        }

        mergeHorisontal(next) {
            let offsetX = this.posX;
            xMath.range(0, this.cells.length - 1).forEach(i => {
                let $this = this.cells[i];
                let $next = next.cells[i];

                let tData = $this.data();
                let nData = $next.data();

                tData.posX = offsetX;
                tData.sizeX += nData.sizeX;

                if ($this.data('type') !== 'title') {
                    offsetX = tData.posX + tData.sizeX;
                }

                $this.data(tData).attr('colspan', tData.sizeX);
            });

            this.sizeX += next.sizeX;
            next.cells.forEach($cell => $cell.remove());
        }

        static findCell($table, x, y) {
            let $cells = $table.children('tbody').find('td');
            let $fCell = null;
            $cells.toArray().some(cell => {
                let $cell = $(cell);
                let { posX, posY } = $cell.data();
                if (posX === x && posY === y) {
                    $fCell = $cell;
                    return true;
                }
            });
            return $fCell;
        }

        static getCell($table, x, y) {
            return new Cell($table, Cell.findCell($table, x, y));
        }

        static getWeek($table, x, y) {
            let $cells = $table.children('tbody').find('td');
            let fCell = new Cell($table, null);
            $cells.toArray().some(cellDOM => {
                let cell = new Cell($table, $(cellDOM), true);
                if (cell.ok && x >= cell.posX && x < cell.posX + cell.sizeX && cell.posY === y) {
                    fCell = cell;
                    return true;
                }
            });
            return fCell;
        }
    }

    window.TableTweaker = TableTweaker;
    window.Cell = Cell;
})();
