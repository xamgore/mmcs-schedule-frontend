/* global helpers, Table, TableTweaker, system */
(function () {
    'use strict';

    /**
     * Конструктор класса Schedule
     * @param {jQuery} $table блок таблицы
     * @param {string} type   тип расписания
     * @param {object} data   данные о занятиях
     */
    var Schedule = window.Schedule = function ($table, type, data) {
        $table.html('');

        this.$table = $('<table></table>').appendTo($table);
        this.type = type;

        this.buildTimes(system.times);
        this.buildHeader();
        this.buildLessons(data.lessons, data.curricula, data.groups || [], system.times);
        this.buildData();
        this.buildTweaksList();
    };

    /**
     * Подготовка времени пар
     * @param  {array}    times массив времен
     * @return {Schedule}       this
     */
    Schedule.prototype.buildTimes = function (times) {
        this.times = times.map(function (time) {
            return helpers.time.getString(time.cbeg) + '<br>-<br>' + helpers.time.getString(time.cend);
        });

        return this;
    };

    /**
     * Построение шапки
     * @return {Schedule} this
     */
    Schedule.prototype.buildHeader = function () {
        switch (this.type) {
            case 'group':
            case 'teacher':
                this.header = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
                break;
        }

        return this;
    };

    /**
     * Построение занятий
     * @param  {array}    lessons   занятия
     * @param  {array}    curricula дисциплины
     * @param  {array}    groups    группы
     * @param  {array}    times     массив времен
     * @return {Schedule}           this
     */
    Schedule.prototype.buildLessons = function (lessons, curricula, groups, times) {
        if (!lessons) {
            throw new Error('Empty lessons');
        }

        curricula = helpers.array.groupBy(curricula, 'lessonid');

        groups.forEach(function (group) {
            var name = group.gradenum + '.' + group.groupnum;
            if (group.name !== 'NULL') {
                name += '(' + group.name + ')';
            }
            group.name = name;
        });
        groups = helpers.array.groupBy(groups, 'uberid');

        times = times.map(function (time) {
            return {
                begin: helpers.time.getStamp(time.cbeg),
                end: helpers.time.getStamp(time.cend)
            };
        });

        var titles = [];
        switch (this.type) {
            case 'group':
            case 'teacher':
                titles = [0, 1, 2, 3, 4, 5];
                break;
        }

        this.lessons = [];
        lessons.forEach(function (lesson) {
            try {
                this.lessons.push(new ScheduleLesson(
                    this.type,
                    lesson, curricula[lesson.id], groups[lesson.uberid],
                    times, titles
                ));
            } catch (error) {
                console.log(error, lesson);
            }
        }, this);

        return this;
    };

    /**
     * Построение данных о занятиях
     * @return {Schedule} this
     */
    Schedule.prototype.buildData = function () {
        this.data = new Array(this.times.length);
        for (var i = 0, sz = this.data.length; i < sz; i++) {
            this.data[i] = new Array(this.header.length);
            helpers.array.fill(this.data[i], null);
        }

        this.lessons.forEach(function (lesson) {
            var row = lesson.pos.row;
            var col = lesson.pos.col;
            if (this.data[row][col]) {
                this.data[row][col].push(lesson);
            } else {
                this.data[row][col] = [lesson];
            }

        }, this);

        this.data = this.data.map(function (row) {
            return row.map(function (cell) {
                return new ScheduleCell(this.type, cell).toArray();
            }, this);
        }, this);

        return this;
    };

    /**
     * Построение списка твиков
     * @return {Schedule} this
     */
    Schedule.prototype.buildTweaksList = function () {
        switch (this.type) {
            case 'group':
            case 'teacher':
                this.tweaksList = ['mergeVertical', 'fixWidth'];
                break;
        }

        return this;
    };

    /**
     * Отрисовка расписания
     * @return {Schedule} this
     */
    Schedule.prototype.draw = function () {
        this.table = new Table(this.$table, this.data, this.times, this.header);
        this.table.draw();

        var tweaker = new TableTweaker(this.$table, this.tweaksList);
        tweaker.apply();

        return this;
    };

    /**
     * Деструктор класса Schedule
     */
    Schedule.prototype.destruct = function () {
        this.table.destruct();
    };


    /**
     * Конструктор класса ScheduleLesson
     * @param {string} type      тип расписания
     * @param {object} lesson    информация о занятии
     * @param {array}  curricula дисциплины занятия
     * @param {array}  groups    группы занятия
     * @param {array}  times     массив времен
     * @param {array}  titles    массив заголовков
     */
    var ScheduleLesson = function (type, lesson, curricula, groups, times, titles) {
        this.type = type;

        this.build(lesson, curricula, groups || [], times, titles);
    };

    /**
     * Построение занятия
     * @param  {object}         lesson    информация о занятии
     * @param  {array}          curricula дисциплины занятия
     * @param  {array}          groups    группы занятия
     * @param  {array}          times     массив времен
     * @param  {array}          titles    массив заголовков
     * @return {ScheduleLesson}           this
     */
    ScheduleLesson.prototype.build = function (lesson, curriculaRaw, groups, times, titles) {
        if (!curriculaRaw) {
            throw new Error('Lesson has empty curricula');
        }

        this.setTimeAndPos(lesson.timeslot, times, titles);

        var curricula = new Array(lesson.subcount);
        helpers.array.fill(curricula, null);
        var groupName = groups.map(function (group) {
            return group.name;
        }).join(', ');
        curriculaRaw.forEach(function (curriculum) {
            curricula[curriculum.subnum - 1] = {
                subject: {
                    name: curriculum.subjectname,
                    abbr: curriculum.subjectabbr || curriculum.subjectname
                },
                teacher: {
                    name: curriculum.teachername,
                    abbr: helpers.abbrName(curriculum.teachername),
                    degree: curriculum.teacherdegree
                },
                room: {
                    name: curriculum.roomname
                },
                group: {
                    name: groupName
                }
            };
        }, this);

        this.mergeCurricula(curricula);

        return this;
    };

    /**
     * Устновка времени и позиции занятия
     * @param  {object}         timeslot timeslot занятия
     * @param  {array}          times    массив времен
     * @param  {array}          titles   массив заголовков
     * @return {ScheduleLesson}          this
     */
    ScheduleLesson.prototype.setTimeAndPos = function (timeslot, times, titles) {
        var time = timeslot.replace(/[\(\)]/g, '').split(',');

        this.time = {
            begin: helpers.time.getStamp(helpers.time.parse(time[1])),
            end: helpers.time.getStamp(helpers.time.parse(time[2]))
        };

        var row;
        times.some(function (time, index) {
            if (helpers.compare(time, this.time)) {
                row = index;
                return true;
            }
        }, this);
        if (row == null) {
            throw new Error('Сan not find lesson row');
        }

        var col;
        titles.some(function (title, index) {
            if (title === Number(time[0])) {
                col = index;
                return true;
            }
        }, this);
        if (col == null) {
            throw new Error('Сan not find lesson column');
        }

        this.pos = {
            row: row,
            col: col,
            week: time[3]
        };

        return this;
    };

    /**
     * [description]
     * @param  {[type]}         curricula [description]
     * @return {ScheduleLesson}           this
     */
    ScheduleLesson.prototype.mergeCurricula = function (curricula) {
        this.groups = [];

        curricula.forEach(function (curriculum) {
            if (!curriculum) {
                this.groups.push(null);
                return;
            }

            var lastGroup = helpers.array.last(this.groups);
            if (lastGroup && helpers.compare(lastGroup.subject, curriculum.subject)) {
                lastGroup.curricula.push(curriculum);
            } else {
                this.groups.push({
                    subject: curriculum.subject,
                    curricula: [curriculum]
                });
            }
        },this);

        switch (this.type) {
            case 'group':
            case 'teacher':
                this.groups = this.groups.map(function (group) {
                    if (!group) {
                        return null;
                    }

                    var newCurricula = [];

                    group.curricula.forEach(function (curriculum) {
                        if (!curriculum) {
                            newCurricula.push(null);
                            return;
                        }

                        var lastCurriculum = helpers.array.last(newCurricula);
                        if (
                            lastCurriculum &&
                            helpers.compare(lastCurriculum.teacher, curriculum.teacher) &&
                            helpers.compare(lastCurriculum.group, curriculum.group)
                        ) {
                            lastCurriculum.room.name.split(', ');
                        } else {
                            newCurricula.push(curriculum);
                        }
                    });

                    return {
                        subject: group.subject,
                        curricula: newCurricula,
                        length: group.curricula.length
                    };
                });
        }
    };


    /**
     * Конструктор ScheduleCell
     * @param {string} type    тип расписания
     * @param {array}  lessons занятия
     */
    var ScheduleCell = function(type, lessons) {
        this.type = type;

        if (lessons) {
            this.build(lessons);
        } else {
            this.data = null;
        }
    };

    /**
     * Построение данных ячейки
     * @param  {array}        lessons занятия
     * @return {ScheduleCell}         this
     */
    ScheduleCell.prototype.build = function (lessons) {
        var upper = [];
        var lower = [];
        var hasFull = false;
        var hasNotFull = false;

        lessons.forEach(function (lesson) {
            switch (lesson.pos.week) {
                case 'full':
                    helpers.array.setLength(upper, Math.max(upper.length, lower.length));
                    helpers.array.setLength(lower, Math.max(upper.length, lower.length));
                    upper = upper.concat(lesson.groups);
                    lower = lower.concat(lesson.groups);

                    hasFull = true;

                    break;

                case 'upper':
                    upper = upper.concat(lesson.groups);

                    if (hasFull) {
                        helpers.array.setLength(lower, upper.length);
                    }

                    hasNotFull = true;

                    break;

                case 'lower':
                    lower = lower.concat(lesson.groups);

                    if (hasFull) {
                        helpers.array.setLength(upper, upper.length);
                    }

                    hasNotFull = true;

                    break;
            }
        });

        upper = this.buildLesson(upper);
        lower = this.buildLesson(lower);

        if (!upper.length) {
            upper = null;
        }

        if (!lower.length) {
            lower = null;
        }

        if (hasNotFull) {
            this.data = [ upper, lower ];
        } else {
            this.data = [ upper ];
        }

        return this;
    };

    /**
     * Построение ячейки дисциплины
     * @param  {array}        week дисциплины
     * @return {ScheduleCell}      this
     */
    ScheduleCell.prototype.buildLesson = function (week) {
        switch (this.type) {
            case 'group':
                return week.map(function (group) {
                    if (!group) {
                        return null;
                    }

                    var title = '<span class="lesson-titie">' +
                        '<span class="subject full">' + group.subject.name + '</span>' +
                        '<span class="subject short">' +
                            '<abbr title="' + group.subject.name + '">' + group.subject.abbr + '</abbr>' +
                        '</span>' +
                    '</span>';

                    var contents = group.curricula.map(function (curriculum) {
                        return '<span class="lesson-content">' +
                            '<span class="teacher">' +
                                '<abbr title="' + curriculum.teacher.name + '">' + curriculum.teacher.abbr + '</abbr>' +
                            '</span>' +
                            '<span class="room">' + curriculum.room.name + '</span>' +
                        '</span>';
                    });

                    return {
                        title: title,
                        contents: contents
                    };
                });

            case 'teacher':
                return week.map(function (group) {
                    if (!group) {
                        return null;
                    }

                    var title = '<span class="lesson-titie">' +
                        '<span class="subject full">' + group.subject.name + '</span>' +
                        '<span class="subject short">' +
                            '<abbr title="' + group.subject.name + '">' + group.subject.abbr + '</abbr>' +
                        '</span>' +
                    '</span>';

                    var contents = group.curricula.map(function (curriculum) {
                        return '<span class="lesson-content">' +
                            '<span class="group">' + curriculum.group.name + '</span>' +
                            '<span class="room">' + curriculum.room.name + '</span>' +
                        '</span>';
                    });

                    return {
                        title: title,
                        contents: contents
                    };
                });
        }
    };

    /**
     * Преобразование в массив
     * @return {array} данные ячейки
     */
    ScheduleCell.prototype.toArray = function () {
        return this.data;
    };
})();
