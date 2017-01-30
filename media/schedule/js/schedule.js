(() => {
    'use strict';

    class Schedule {
        /**
         * @param {string} type Тип расписания
         * @param {object} data Данные о занятиях
         */
        constructor(type, data) {
            this.type = type;
            this.weekday = data.weekday || '';

            this.buildTimes(system.times);
            this.buildHeader(data.groups || []);
            this.buildLessons(data.lessons, data.curricula, data.groups || [], system.times);
            this.buildData();
        }

        /**
         * Подготовка времени пар
         * @param  {array}    times Массив времен
         * @return {Schedule}       this
         */
        buildTimes(times) {
            this.times = times.map((time) => helpers.time.getString(time.cbeg) + '<br>-<br>' + helpers.time.getString(time.cend));
            return this;
        }

        /**
         * Построение шапки
         * @return {Schedule} this
         */
        buildHeader(groups) {
            switch (this.type) {
                case 'group':
                case 'teacher':
                case 'room':
                    this.header = [ 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота' ];
                    break;

                case 'day':
                    this.header = groups.map(group => helpers.getGroupName(group));
                    break;
            }

            return this;
        }

        /**
         * Построение занятий
         * @param  {array}    lessons   Занятия
         * @param  {array}    curricula Дисциплины
         * @param  {array}    groups    Группы
         * @param  {array}    times     Массив времен
         * @return {Schedule}           this
         */
        buildLessons(lessons, curricula, groups, times) {
            if (!lessons) throw new Error('Empty lessons');

            curricula = helpers.array.groupBy(curricula, 'lessonid');

            switch (this.type) {
                case 'teacher':
                case 'room':
                    groups = helpers.array.groupBy(groups, 'uberid');
                    break;
            }

            times = times.map(({ cbeg, cend }) => ({
                begin: helpers.time.getStamp(cbeg),
                end: helpers.time.getStamp(cend),
            }));

            let titles = [];
            switch (this.type) {
                case 'group':
                case 'teacher':
                case 'room':
                    titles = [ 0, 1, 2, 3, 4, 5 ];
                    break;

                case 'day':
                    titles = groups.map(({ id }) => id);
                    break;
            }

            this.lessons = [];
            lessons.forEach(lesson => {
                try {
                    let groupsForLesson = groups && groups.hasOwnProperty(lesson.uberid) ? groups[lesson.uberid] : [];
                    this.lessons.push(new ScheduleLesson(this.type, lesson, curricula[lesson.id], groupsForLesson, times, titles));
                } catch (error) {
                    console.log(error, lesson);
                }
            });

            return this;
        }

        /**
         * Построение данных о занятиях
         * @return {Schedule} this
         */
        buildData() {
            this.data = new Array(this.times.length);
            for (let row = 0, dataLength = this.data.length; row < dataLength; row++) {
                this.data[row] = new Array(this.header.length).fill(null);
            }

            this.lessons.forEach(lesson => {
                let { row, col } = lesson.pos;
                if (this.data[row][col]) {
                    this.data[row][col].push(lesson);
                } else {
                    this.data[row][col] = [ lesson ];
                }
            });

            this.data = this.data.map(row => row.map(cell => (new ScheduleCell(this.type, cell)).toArray()));

            return this;
        }

        /**
         * Отрисовка расписания
         * @param  {jQuery}   $block Блок для таблиц
         * @return {Schedule}        this
         */
        draw($block) {
            let $table = $('<table></table>').appendTo($block);

            (new Table(this.data, this.times, this.header, this.weekday)).draw($table);

            let tweaker = new TableTweaker($table);
            switch (this.type) {
                case 'group':
                    tweaker.mergeCellsVertical();
                    break;

                case 'day':
                    tweaker.mergeWeeks();
                    tweaker.mergeCellsVertical();
                    tweaker.setGroupsHeader();
                    break;

                case 'teacher':
                case 'room':
                    tweaker.deleteEmptySubgroups();
                    tweaker.mergeCellsVertical();
                    break;
            }
            tweaker.fixWidth();
            if (system.week) tweaker.blurWeeks([ 'upper', 'lower' ].indexOf(system.week), 2);
            tweaker.draw();

            return this;
        };
    }

    class ScheduleLesson {
        /**
         * @param {string} type      Тип расписания
         * @param {object} lesson    Информация о занятии
         * @param {array}  curricula Дисциплины занятия
         * @param {array}  groups    Группы занятия
         * @param {array}  times     Массив времен
         * @param {array}  titles    Массив заголовков
         */
        constructor(type, lesson, curricula, groups, times, titles) {
            this.type = type;
            this.id = lesson.id;

            this.build(lesson, curricula, groups, times, titles);
        }

        /**
         * Построение занятия
         * @param  {object}         lesson    Информация о занятии
         * @param  {array}          curricula Дисциплины занятия
         * @param  {array}          groups    Группы занятия
         * @param  {array}          times     Массив времен
         * @param  {array}          titles    Массив заголовков
         * @return {ScheduleLesson}           this
         */
        build(lesson, curriculaRaw, groups, times, titles) {
            if (!curriculaRaw) throw new Error('Lesson has empty curricula');

            this.setTimeAndPos(lesson.timeslot, lesson.groupid, times, titles);

            let curricula = new Array(lesson.subcount).fill(null);
            let groupName = groups.map(group => helpers.getGroupName(group)).join(', ');
            curriculaRaw.forEach(curriculum => {
                curricula[curriculum.subnum - 1] = {
                    subject: {
                        name: curriculum.subjectname,
                        abbr: curriculum.subjectabbr || curriculum.subjectname,
                    },
                    teacher: {
                        name: curriculum.teachername,
                        abbr: helpers.getNameAbbr(curriculum.teachername),
                        degree: curriculum.teacherdegree,
                    },
                    room: {
                        name: curriculum.roomname,
                    },
                    group: {
                        name: groupName,
                    },
                };
            });

            this.mergeCurricula(curricula);

            return this;
        }

        /**
         * Устновка времени и позиции занятия
         * @param  {object}         timeslot Timeslot занятия
         * @param  {array}          times    Массив времен
         * @param  {array}          titles   Массив заголовков
         * @return {ScheduleLesson}          this
         */
        setTimeAndPos(timeslot, groupID, times, titles) {
            let [ day, begin, end, week ] = timeslot.replace(/[\(\)]/g, '').split(',');

            this.time = {
                begin: helpers.time.getStamp(helpers.time.parse(begin)),
                end: helpers.time.getStamp(helpers.time.parse(end))
            };

            let row, col;
            switch (this.type) {
                case 'group':
                case 'teacher':
                case 'room':
                    times.some((time, index) => {
                        if (helpers.compare(time, this.time)) {
                            row = index;
                            return true;
                        }
                    });
                    titles.some((title, index) => {
                        if (title == day) {
                            col = index;
                            return true;
                        }
                    });
                    break;

                case 'day':
                    times.some((time, index) => {
                        if (helpers.compare(time, this.time)) {
                            row = index;
                            return true;
                        }
                    });
                    titles.some((title, index) => {
                        if (title == groupID) {
                            col = index;
                            return true;
                        }
                    });
                    break;
            }

            if (row == null || col == null) throw new Error('Сan not find lesson position');

            this.pos = { row, col, week };

            return this;
        }

        /**
         * Объединение группы занятий
         * @param  {object[]}       curricula Группа занятий
         * @return {ScheduleLesson}           this
         */
        mergeCurricula(curricula) {
            this.groups = [];

            curricula.forEach(curriculum => {
                if (!curriculum) {
                    this.groups.push(null);
                    return;
                }

                let lastGroup = helpers.array.last(this.groups);
                if (lastGroup && helpers.compare(lastGroup.subject, curriculum.subject)) {
                    lastGroup.curricula.push(curriculum);
                } else {
                    this.groups.push({
                        subject: curriculum.subject,
                        curricula: [curriculum]
                    });
                }
            });

            switch (this.type) {
                case 'group':
                case 'day':
                case 'teacher':
                    this.groups = this.groups.map(group => {
                        if (!group) return null;

                        let newCurricula = [];
                        group.curricula.forEach(curriculum => {
                            if (!curriculum) {
                                newCurricula.push(null);
                                return;
                            }

                            let lastCurriculum = helpers.array.last(newCurricula);
                            if (
                                lastCurriculum &&
                                helpers.compare(lastCurriculum.teacher, curriculum.teacher) &&
                                helpers.compare(lastCurriculum.group, curriculum.group)
                            ) {
                                lastCurriculum.room.name += `, ${curriculum.room.name}`;
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
                    break;
            }
        }
    }

    class ScheduleCell {
        /**
         * @param {string} type    Тип расписания
         * @param {array}  lessons Занятия
         */
        constructor(type, lessons) {
            this.type = type;

            if (!lessons) {
                this.data = null;
                return;
            }

            this.build(lessons);
        }

        /**
         * Построение данных ячейки
         * @param  {array}        lessons Занятия
         * @return {ScheduleCell}         this
         */
        build(lessons) {
            let upper = [];
            let lower = [];
            let hasFull = false;
            let hasNotFull = false;

            lessons.forEach(lesson => {
                lesson.groups.forEach(group => group && (group.lessonID = lesson.id));

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

                        if (hasFull) helpers.array.setLength(lower, upper.length);

                        hasNotFull = true;

                        break;

                    case 'lower':
                        lower = lower.concat(lesson.groups);

                        if (hasFull) helpers.array.setLength(upper, upper.length);

                        hasNotFull = true;

                        break;
                }
            });

            upper = this.buildLesson(upper);
            lower = this.buildLesson(lower);

            if (!upper.length) upper = null;
            if (!lower.length) lower = null;

            this.data = hasNotFull ? [ upper, lower ] : [ upper ];

            return this;
        }

        /**
         * Построение ячейки дисциплины
         * @param  {array}        week Дисциплины
         * @return {ScheduleCell}      this
         */
        buildLesson(week) {
            switch (this.type) {
                case 'group':
                case 'day':
                    return week.map(group => {
                        if (!group) return null;

                        let title = '<span class="lesson-titie">' +
                            `<span class="subject full">${group.subject.name}</span>` +
                            '<span class="subject short">' +
                                `<abbr title="${group.subject.name}">${group.subject.abbr}</abbr>` +
                            '</span>' +
                        '</span>';

                        let contents = group.curricula.map(curriculum => '<span class="lesson-content">' +
                            '<span class="teacher">' +
                                `<abbr title="${curriculum.teacher.name}">${curriculum.teacher.abbr}</abbr>` +
                            '</span>' +
                            `<span class="room">${curriculum.room.name}</span>` +
                        '</span>');

                        let lessonID = group.lessonID;

                        return { title, contents, lessonID };
                    });

                case 'teacher':
                    return week.map(group => {
                        if (!group) return null;

                        let title = '<span class="lesson-titie">' +
                            `<span class="subject full">${group.subject.name}</span>` +
                            '<span class="subject short">' +
                                `<abbr title="${group.subject.name}">${group.subject.abbr}</abbr>` +
                            '</span>' +
                        '</span>';

                        let contents = group.curricula.map(curriculum => '<span class="lesson-content">' +
                            `<span class="group">${curriculum.group.name}</span>` +
                            `<span class="room">${curriculum.room.name}</span>` +
                        '</span>');

                        let lessonID = group.lessonID;

                        return { title, contents, lessonID };
                    });

                case 'room':
                    return week.map(group => {
                        if (!group) return null;

                        let title = '<span class="lesson-titie">' +
                            `<span class="subject full">${group.subject.name}</span>` +
                            '<span class="subject short">' +
                                `<abbr title="${group.subject.name}">${group.subject.abbr}</abbr>` +
                            '</span>' +
                        '</span>';

                        let contents = group.curricula.map(curriculum => '<span class="lesson-content">' +
                            '<span class="teacher">' +
                                `<abbr title="${curriculum.teacher.name}">${curriculum.teacher.abbr}</abbr>` +
                            '</span>' +
                            `<span class="group">${curriculum.group.name}</span>` +
                        '</span>');

                        let lessonID = group.lessonID;

                        return { title, contents, lessonID };
                    });
            }
        }

        /**
         * Преобразование в массив
         * @return {array} Данные ячейки
         */
        toArray() {
            return this.data;
        }
    }

    window.Schedule = Schedule;
})();
