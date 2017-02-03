(() => {
    'use strict';

    class Switcher {
        /**
         * Настройка селекторов
         * @return {Switcher} this
         */
        set() {
            // Добавление селекторов
            this.type = new Select('type', system.$switch).hide();
            this.course = new Select('course', system.$switch).hide();
            this.group = new Select('group', system.$switch).hide();
            this.day = new Select('day', system.$switch).hide();
            this.teacher = new Select('teacher', system.$switch).hide();
            this.room = new Select('room', system.$switch).hide();

            // Действие при сбросе выбора типа расписания
            this.type.bind([ 'default' ], () => {
                this.course.hide();
                this.group.hide();
                this.day.hide();
                this.teacher.hide();
                this.room.hide();
                this.closeSchedule();
            });

            // Действие при выборе группы в типе расписания
            this.type.bind([ 'course', 'group' ], () => {
                this.course.hide();
                this.group.hide();
                this.day.hide();
                this.teacher.hide();
                this.room.hide();

                api.switcher.getCourses(result => {
                    let degreeMap = {
                        bachelor: '',
                        master: 'Магистратура, ',
                        postgraduate: 'Аспирантура, ',
                    };

                    this.course.fill('Выберите курс', result.map(course => ({
                        value: course.id,
                        text: degreeMap[course.degree] + course.num + ' курс'
                    }))).show();
                });
            });

            // Действие при выборе курса
            this.course.bind(course => {
                this.group.hide();
                this.day.hide();

                if (course === 'default') {
                    this.closeSchedule();
                    return;
                }

                switch (this.type.value) {
                    case 'course':
                        setTimeout(() => {
                            this.day.fill('Неделя', [ 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота' ].map((day, index) => ({
                                value: index,
                                text: day
                            }))).show();
                        }, 0);
                        break;

                    case 'group':
                        api.switcher.getGroups(course, result => {
                            this.group.fill('Выберите группу', result.map(group => {
                                let name = group.num + ' группа';
                                if (group.name && group.name !== 'NULL') {
                                    name = group.name + ', ' + name;
                                }

                                return {
                                    value: group.id,
                                    text: name
                                };
                            })).show();
                        });
                        break;
                }
            });

            // Действие при выборе группы
            this.group.bind(group => {
                if (group === 'default') {
                    this.closeSchedule();
                    return;
                }

                api.schedule.getForGroup(group, result => this.openSchedule('group', result));
            });

            // Действие при выборе группы
            this.day.bind(day => {
                if (day === 'default') {
                    api.schedule.getForCourse(this.course.value, result => this.openSchedule('course', result));
                } else {
                    api.schedule.getForDay(this.course.value, day, result => this.openSchedule('day', result));
                }
            });

            // Действие при выборе преподавателя в типе расписания
            this.type.bind([ 'teacher' ], () => {
                this.course.hide();
                this.group.hide();
                this.day.hide();
                this.teacher.hide();
                this.room.hide();

                api.switcher.getTeachers(result => {
                    this.teacher.fill('Выберите преподавателя', result.map(teacher => ({
                        value: teacher.id,
                        text: teacher.name
                    }))).show();
                });
            });

            // Действие при выборе преподавателя
            this.teacher.bind(teacher => {
                if (teacher === 'default') {
                    this.closeSchedule();
                    return;
                }

                api.schedule.getForTeacher(teacher, result => {
                    this.openSchedule('teacher', result);
                });
            });

            // Действие при выборе аудитории в типе расписания
            this.type.bind([ 'room' ], () => {
                this.course.hide();
                this.group.hide();
                this.day.hide();
                this.teacher.hide();
                this.room.hide();

                api.switcher.getRooms(result => {
                  this.room.fill('Выберите Аудиторию', result.map(room => ({
                        value: room.id,
                        text: room.name
                    }))).show();
                });
            });

            // Действие при выборе аудитории
            this.room.bind(room => {
                if (room === 'default') {
                    this.closeSchedule();
                    return;
                }

                api.schedule.getForRoom(room, result => this.openSchedule('room', result));
            });

            // localStorage
            this.type.bind((type, init) => {
                localStorage.type = type;
                if (!init) {
                    localStorage.course = 'default';
                    localStorage.teacher = 'default';
                    localStorage.room = 'default';
                }
            });
            this.course.bind((course, init) => {
                localStorage.course = course;
                if (!init || localStorage.type !== 'group') {
                    localStorage.group = 'default';
                }
                if (!init || localStorage.type !== 'course') {
                    localStorage.day = 'default';
                }
            });
            this.group.bind(group => localStorage.group = group);
            this.day.bind(day => localStorage.day = day);
            this.teacher.bind(teacher => localStorage.teacher = teacher);
            this.room.bind(room => localStorage.room = room);

            // Заполнение и отображение селектора типа расписания
            this.type.fill('Тип расписания', [ {
                value: 'course',
                text: 'Курс',
            },  {
                value: 'group',
                text: 'Группа',
            }, {
                value: 'teacher',
                text: 'Преподаватель',
            }, {
                value: 'room',
                text: 'Аудитория',
            }, {
                value: 'chair',
                text: 'Кафедра',
                disabled: true,
            }, {
                value: 'session',
                text: 'Сессия',
                disabled: true,
            } ]).show();

            return this;
        }

        /**
         * Открыть расписание
         * @param  {string}   type Тип расписания
         * @param  {object}   data Данные расписания
         * @return {Switcher}      this
         */
        openSchedule(type, data) {
            system.$schedule.html('');

            switch (type) {
                case 'course':
                    [ 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ' ].forEach((weekday, index) => (new Schedule('day', { 
                        lessons: data.lessons.filter(({ timeslot }) => timeslot[1] == index),
                        curricula: data.curricula,
                        groups: data.groups,
                        weekday: weekday,
                    })).draw($('<div class="schedule"></div>').appendTo(system.$schedule)));
                    break;

                case 'group':
                case 'teacher':
                case 'day':
                case 'room':
                    (new Schedule(type, data)).draw($('<div class="schedule"></div>').appendTo(system.$schedule));
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

    window.Switcher = Switcher;
})();
