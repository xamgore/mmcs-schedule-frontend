(() => {
    'use strict';

    class Switcher {
        /**
         * Настройка селекторов
         * @return {Switcher} this
         */
        set() {
            // Добавление селекторов
            this.type       = new Select('type').hide();
            this.course     = new Select('course').hide();
            this.group      = new Select('group').hide();
            this.day        = new Select('day').hide();
            this.teacher    = new Select('teacher').hide();
            this.room       = new Select('room').hide();

            // Действие при сбросе выбора типа расписания
            this.type.bind([ '' ], () => {
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

                if (course === '') {
                    this.closeSchedule();
                    return;
                }

                switch (this.type.value) {
                    case 'course':
                        this.day.fill('Неделя', [ 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота' ].map((day, index) => ({
                            value: index,
                            text: day
                        }))).show();
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
                if (group === '') {
                    this.closeSchedule();
                    return;
                }

                api.schedule.getForGroup(group, result => this.openSchedule('group', result));
            });

            // Действие при выборе группы
            this.day.bind(day => {
                if (day === '') {
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
                if (teacher === '') {
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
                if (room === '') {
                    this.closeSchedule();
                    return;
                }

                api.schedule.getForRoom(room, result => this.openSchedule('room', result));
            });

            // localStorage
            this.type.bind((type, init) => {
                localStorage.type = type;
                if (!init) {
                    localStorage.course = '';
                    localStorage.teacher = '';
                    localStorage.room = '';
                }
            });
            this.course.bind((course, init) => {
                localStorage.course = course;
                if (!init || localStorage.type !== 'group') {
                    localStorage.group = '';
                }
                if (!init || localStorage.type !== 'course') {
                    localStorage.day = '';
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

    class Select {
        /**
         * @param  {string} id ID селектора
         */
        constructor(id) {
            this.id = id;
            this.$select = $(`<select class="select" id="${id}"></select>`).appendTo(system.$switch);
        }

        /**
         * Создать опцию для селекта
         * @param  {string} value    Значение опции
         * @param  {string} text     Текст опции
         * @param  {bool}   disabled Отключение опции
         * @return {string}          HTML опции
         */
        static createOption(value, text, disabled) {
            return $(`<option value="${value}">${text}</option>`).prop('disabled', disabled);
        }

        /**
         * Заполнение селекта
         * @param  {select}   text Текст опции по-умолчанию
         * @param  {object[]} data Массив опций
         * @return {Select}        this
         */
        fill(text, data) {
            this.$select.html('');

            Select.createOption('', text).appendTo(this.$select);
            data.forEach(item => Select.createOption(item.value, item.text, item.disabled).appendTo(this.$select));

            let value = localStorage[this.id];
            if (value != null) {
                this.initValue = value;
            } else {
                this.value = '';
            }

            return this;
        }

        /**
         * Привязать действие на селектор
         * @param  {string[]} values   Список опций для которых выполняется, по-умолчанию - для всех
         * @param  {function} callback
         * @return {Select}            this
         */
        bind(values, callback) {
            if (typeof values === 'function') {
                callback = values;
                values = null;
            }

            this.$select.change((event, param) => {
                if (values == null || values.includes(this.value)) callback(this.value, param);
            });

            return this;
        }

        /**
         * Отобразить селектор
         * @return {Select} this
         */
        show() {
            this.$select.show();
            return this;
        }

        /**
         * Скрыть селектор
         * @return {Select} this
         */
        hide() {
            this.$select.hide();
            return this;
        }

        /**
         * Получить значение
         * @return {string} Значение
         */
        get value() {
            return this.$select.val();
        }

        /**
         * Задать значение
         * @param {string} value Значение
         */
        set value(value) {
            this.$select.find(`[value="${value}"]`).prop('selected', true);
            this.$select.trigger('change');
        }

        /**
         * Задать значение с флагом init
         * @param {string} value Значение
         */
        set initValue(value) {
            this.$select.find(`[value="${value}"]`).prop('selected', true);
            this.$select.trigger('change', [ true ]);
        }
    }

    window.Switcher = Switcher;
})();
