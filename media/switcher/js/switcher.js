(() => {
    'use strict';

    class Switcher {
        /**
         * Настройка селекторов
         * @return {Switcher} this
         */
        set() {
            let swither = this;

            this.selectors = new Vue({
                el: system.switch,
                data: {
                    type: null,
                    course: null,
                    day: null,
                    group: null,
                    teacher: null,
                    room: null,

                    types: null,
                    courses: null,
                    days: null,
                    groups: null,
                    teachers: null,
                    rooms: null,

                    initState: true,
                },
                watch: {
                    type: function () {
                        if (!this.type) return;

                        if (!this.initState) {
                            localStorage.type = this.type;
                            delete localStorage.course;
                            delete localStorage.day;
                            delete localStorage.group;
                            delete localStorage.teacher;
                            delete localStorage.room;
                        }

                        this.course = null;
                        this.day = null;
                        this.group = null;
                        this.teacher = null;
                        this.room = null;

                        if (this.type === 'default') {
                            this.initState = false;
                            swither.closeSchedule();
                            return;
                        }

                        switch (this.type) {
                            case 'course':
                            case 'group':
                                api.switcher.getCourses(result => {
                                    let degreeMap = {
                                        bachelor: '',
                                        master: 'Магистратура, ',
                                        postgraduate: 'Аспирантура, ',
                                    };

                                    this.courses = Select.getOptions('Курс', result.map(course => ({
                                        id: course.id,
                                        text: degreeMap[course.degree] + course.num + ' курс',
                                    })));

                                    this.course = this.initState && localStorage.course ? localStorage.course : 'default';
                                });
                                break;

                            case 'teacher':
                                api.switcher.getTeachers(result => {
                                    this.teachers = Select.getOptions('Преподаватель', result.map(teacher => ({
                                        id: teacher.id,
                                        text: teacher.name || 'Без имени',
                                    })));

                                    this.teacher = this.initState && localStorage.teacher ? localStorage.teacher : 'default';
                                });
                                break;

                            case 'room':
                                api.switcher.getRooms(result => {
                                    this.rooms = Select.getOptions('Аудитория', result.map(room => ({
                                        id: room.id,
                                        text: room.name || 'Без названия',
                                    })));

                                    this.room = this.initState && localStorage.room ? localStorage.room : 'default';
                                });
                                break;
                        }
                    },
                    course: function () {
                        if (!this.course) return;

                        if (!this.initState) {
                            localStorage.course = this.course;
                            delete localStorage.day;
                            delete localStorage.group;
                        }

                        this.day = null;
                        this.group = null;

                        if (this.course === 'default') {
                            this.initState = false;
                            swither.closeSchedule();
                            return;
                        }

                        switch (this.type) {
                            case 'course':
                                setTimeout(() => {
                                    this.days = Select.getOptions('Неделя', [ 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота' ].map((day, index) => ({
                                        id: index,
                                        text: day,
                                    })));

                                    this.day = this.initState && localStorage.day ? localStorage.day : 'default';
                                });
                                break;

                            case 'group':
                                api.switcher.getGroups(this.course, result => {
                                    this.groups = Select.getOptions('Группа', result.map(group => {
                                        let name = group.num + ' группа';
                                        if (group.name && group.name !== 'NULL') {
                                            name = group.name + ', ' + name;
                                        }

                                        return {
                                            id: group.id,
                                            text: name,
                                        };
                                    }));

                                    this.group = this.initState && localStorage.group ? localStorage.group : 'default';
                                });
                                break;
                        }
                    },
                    day: function() {
                        if (!this.day) return;

                        if (!this.initState) localStorage.day = this.day;
                        this.initState = false;

                        if (this.day === 'default') {
                            api.schedule.getForCourse(this.course, result => swither.openSchedule('course', result));
                        } else {
                            api.schedule.getForDay(this.course, this.day, result => swither.openSchedule('day', result));
                        }
                    },
                    group: function() {
                        if (!this.group) return;

                        if (!this.initState) localStorage.group = this.group;
                        this.initState = false;

                        if (this.group === 'default') {
                            swither.closeSchedule();
                            return;
                        }

                        api.schedule.getForGroup(this.group, result => swither.openSchedule('group', result));
                    },
                    teacher: function () {
                        if (!this.teacher) return;

                        if (!this.initState) localStorage.teacher = this.teacher;
                        this.initState = false;

                        if (this.teacher === 'default') {
                            swither.closeSchedule();
                            return;
                        }

                        api.schedule.getForTeacher(this.teacher, result => swither.openSchedule('teacher', result));
                    },
                    room: function () {
                        if (!this.room) return;

                        if (!this.initState) localStorage.room = this.room;
                        this.initState = false;

                        if (this.room === 'default') {
                            swither.closeSchedule();
                            return;
                        }

                        api.schedule.getForRoom(this.room, result => swither.openSchedule('room', result));
                    },
                },
            });

            this.selectors.types = Select.getOptions('Тип расписания', [ {
                id: 'course',
                text: 'Курс',
            },  {
                id: 'group',
                text: 'Группа',
            }, {
                id: 'teacher',
                text: 'Преподаватель',
            }, {
                id: 'room',
                text: 'Аудитория',
            }, {
                id: 'chair',
                text: 'Кафедра',
                disabled: true,
            }, {
                id: 'session',
                text: 'Сессия',
                disabled: true,
            } ]);

            this.selectors.type = localStorage.type || 'default';

            return this;
        }

        /**
         * Открыть расписание
         * @param  {string}   type Тип расписания
         * @param  {object}   data Данные расписания
         * @return {Switcher}      this
         */
        openSchedule(type, data) {
            $(system.schedule).html('');

            switch (type) {
                case 'course':
                    [ 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ' ].forEach((weekday, index) => (new Schedule('day', { 
                        lessons: data.lessons.filter(({ timeslot }) => timeslot[1] == index),
                        curricula: data.curricula,
                        groups: data.groups,
                        weekday: weekday,
                    })).draw($('<div class="schedule"></div>').appendTo($(system.schedule))));
                    break;

                case 'group':
                case 'teacher':
                case 'day':
                case 'room':
                    (new Schedule(type, data)).draw($('<div class="schedule"></div>').appendTo($(system.schedule)));
                    break;
            }

            system.showSchedule();

            return this;
        }

        /**
         * Закрыть расписание
         * @return {Switcher} this
         */
        closeSchedule() {
            system.showIntro();
            return this;
        }
    }

    class Select {
        /**
         * Сгенерировать список опций
         * @param  {select}   text Текст опции по-умолчанию
         * @param  {object[]} data Массив опций
         * @return {Select}        this
         */
        static getOptions(text, data) {
            return [ {
                id: 'default',
                text: text,
                disabled: true,
            } ].concat(data);
        }
    }

    window.Switcher = Switcher;
})();
