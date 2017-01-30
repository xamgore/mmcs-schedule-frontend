(() => {
    'use strict';

    class TableTweaker {
        /**
         * @param {jQuery} $table Блок таблицы
         */
        constructor($table) {
            this.$table = $table;
            this.$header = this.$table.children('thead');
            this.$body = this.$table.children('tbody');

            let bodySize = this.$header.find("#bodySize").data();
            this.width = bodySize.width;
            this.height = bodySize.height;
            
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

        /**
         * Вывод таблицы
         * @return {TableTweaker} this
         */
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

            return this;
        }

        /**
         * Объединение главных ячеек по вертикали
         * @return {TableTweaker} this
         */
        mergeBoths() {
            for (let i = 0, sz = this.cells.length; i < sz; i++) {
                let current = new Cell(this.cells, this.cells[i], true, true);
                if (!current.ok || current.empty) continue;

                let next = Cell.getBoth(this.cells, current.posX, current.posY + current.sizeY);
                if (!next.ok || current.sizeX !== next.sizeX || current.html() !== next.html()) continue;

                current.mergeVertical(next);

                i--;
            }
            
            return this;
        }

        /**
         * Объединение недель по горизонтали
         * @return {TableTweaker} this
         */
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
            
            return this;
        }

        /**
         * Объединение ячеек по вертикали
         * @return {TableTweaker} this
         */
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
            
            return this;
        }

        /**
         * Объединение ячеек по горизонтали
         * @return {TableTweaker} this
         */
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
            
            return this;
        }

        /**
         * Удаление пустых подгрупп
         * @return {TableTweaker} this
         */
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
                        week.width--;
                    }
                });

                week.cells.some(wCell => {
                    if (!wCell || wCell.deleted) return;

                    wCell.width = week.width;
                    wCell.height = week.height;
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
            }
            
            return this;
        }

        /**
         * Пересчет ширины
         * @return {TableTweaker} this
         */
        fixWidth() {
            let $fRow = this.$header.children().first();
            let $fCells = $fRow.children().slice(1);

            let x = 1;
            let yRange = xMath.range(0, this.height);
            let fCells = $fCells.toArray().map(title => {
                let length = Math.max.apply(Math, yRange.map(y => {
                    let week = Cell.getWeek(this.cells, x, y);
                    if (!week.ok) return 0;
                    let divider = week.cells[0].divider || 1;
                    return week.width / divider;
                })) || 1;
                x += Number($(title).attr('colspan'));
                return length;
            });

            let colWidth = 95 / xMath.sum.apply(xMath, fCells);
            fCells.forEach((length, index) => $fCells.eq(index).css('width', `${colWidth * length}%`));
            $fRow.children().last().css('width', 'auto');
            
            return this;
        }

        /**
         * Добавление строки с названиями направлений
         * @return {TableTweaker} this
         */
        setGroupsHeader() {
            let $fRow = this.$header.children().eq(0);
            let $tRow = this.$header.children().eq(1);
            let $aRow = $('<tr></tr>').insertAfter($fRow);

            let $tCells = $tRow.children();
            $tCells.first().detach().attr('rowspan', 2).appendTo($aRow);
            $tCells = $tCells.slice(1);

            $tCells.toArray().forEach(title => {
                let $title = $(title);
                let text = $title.text();
                let [ fullText, titleText, areaText ] = /(.*?) \((.*?)\)/.exec(text) || [ text, text, '' ];

                let $lastArea = $aRow.children().last();
                if ($aRow.children().length > 1 && $lastArea.text() === areaText) {
                    let colspan = Number($lastArea.attr('colspan')) + Number($title.attr('colspan'));
                    $lastArea.attr('colspan', colspan);
                } else {
                    let colspan = Number($title.attr('colspan'));
                    $(`<td colspan="${colspan}"><span>${areaText}</span></td>`).appendTo($aRow);
                }

                $title.html(`<span>${titleText} гр.</span>`);
            });
            
            return this;
        }

        /**
         * Заблюривание ячеек
         * @param  {number}       pos    Номер игнорируемой ячейки
         * @param  {number}       length Количество ячеек, когда будет применяться блюр
         * @return {TableTweaker}        this
         */
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
            
            return this;
        }
    }

    class Cell {
        /**
         * @param {object[]} cells Массив ячеек, в которой требуется искать компоненты для этой
         * @param {object}   cell  Ячейка
         * @param {object}   week  Получить неделю
         * @param {object}   both  Получить главную я чейку (требуется флаг week)
         */
        constructor(cells, cell, week, both) {
            // Флаг корректности
            this.ok = false;

            // Проверка на существование
            if (!cell || cell.deleted) return;

            // Перенос свойств из ячейки
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

            // Проверка на возможность получения недели / главной ячейки
            if (week && !this.isWeek) return;
            if (both && !this.isBoth) return;

            switch (cell.type) {
                // Полная ячейка
                case 'full':
                    this.cells = [ cell ];
                    this.length = 1;
                    break;

                // Заголовок ячейки
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

                // Пустая ячейка
                case 'empty':
                    this.cells = [ cell ];
                    this.length = 1;
                    this.empty = true;
                    break;

                default:
                    return;
            }

            // Получение недели
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

            // Получение полной ячейки
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

            // Флаг корректности
            this.ok = true;
        }

        /**
         * Получение HTML ячейки
         * @return {string} HTML
         */
        html() {
            return this.ok ? this.cells.map(cell => cell.html).join('\n') : '';
        }

        /**
         * Вертикальное объединение ячеек
         * @param  {Cell} next Поглощаемая ячейка
         * @return {Cell}      this
         */
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

            return this;
        }

        /**
         * Горизонтальное объединение ячеек
         * @param  {Cell} next Поглощаемая ячейка
         * @return {Cell}      this
         */
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

            return this;
        }

        /**
         * Поиск ячейки
         * @param  {object[]} cells  Ячейки, среди которых происходит поиск
         * @param  {number}   x      Положение ячейки по X
         * @param  {number}   y      Положение ячейки по Y
         * @param  {bool}     inCell Поиск ячейки, которая содержит указанную позицию, иначе только ВЛ-вершину
         * @return {object}          Найденая ячейка или null
         */
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

        /**
         * Получение ячейки
         * @param  {object[]} cells  Ячейки, среди которых происходит поиск
         * @param  {number}   x      Положение ячейки по X
         * @param  {number}   y      Положение ячейки по Y
         * @param  {bool}     inCell Поиск ячейки, которая содержит указанную позицию, иначе только ВЛ-вершину
         * @return {Cell}            Найденная ячейка или Cell(null)
         */
        static getCell(cells, x, y, inCell) {
            return new Cell(cells, Cell.findCell(cells, x, y, inCell));
        }

        /**
         * Получение недели
         * @param  {object[]} cells  Ячейки, среди которых происходит поиск
         * @param  {number}   x      Положение ячейки по X
         * @param  {number}   y      Положение ячейки по Y
         * @return {Cell}            Найденная ячейка или Cell(null)
         */
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

        /**
         * Получение главной ячейки
         * @param  {object[]} cells  Ячейки, среди которых происходит поиск
         * @param  {number}   x      Положение ячейки по X
         * @param  {number}   y      Положение ячейки по Y
         * @return {Cell}            Найденная ячейка или Cell(null)
         */
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
