/* global api, Schedule, system */
(function () {
    'use strict';

    /**
     * Конструктор класса Switcher
     */
    var Switcher = window.Switcher = function () {};

    /**
     * Настройка переключателей
     * @return {Switcher} this
     */
    Switcher.prototype.set = function () {
        // Добавление селекторов
        this.type = new Select('type').hide();
        this.course = new Select('course').hide();
        this.group = new Select('group').hide();
        this.day = new Select('day').hide();
        this.teacher = new Select('teacher').hide();
        this.room = new Select('room').hide();

        // Действие при сбросе выбора типа расписания
        this.type.bind([''], () => {
            this.course.hide();
            this.group.hide();
            this.day.hide();
            this.teacher.hide();
            this.room.hide();
            this.closeSchedule();
        });

        // Действие при выборе группы в типе расписания
        this.type.bind(['course', 'group'], () => {
            this.course.hide();
            this.group.hide();
            this.day.hide();
            this.teacher.hide();
            this.room.hide();

            api.switcher.getCourses(result => {
                let degreeMap = {
                    bachelor: '',
                    master: 'Магистратура, '
                };

                this.course.fill('Выберите курс', result.map(course => ({
                    value: course.id,
                    text: degreeMap[course.degree] + course.num + ' курс'
                }))).show();
            });
        }, this);

        // Действие при выборе курса
        this.course.bind(course => {
            this.group.hide();
            this.day.hide();

            if (course === '') {
                this.closeSchedule();
                return;
            }

            switch (this.type.val()) {
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
        }, this);

        // Действие при выборе группы
        this.day.bind(day => {
            if (day === '') {
                api.schedule.getForCourse(this.course.val(), result => this.openSchedule('course', result));
            } else {
                api.schedule.getForDay(this.course.val(), day, result => this.openSchedule('day', result));
            }
        }, this);

        // Действие при выборе преподавателя в типе расписания
        this.type.bind(['teacher'], () => {
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
        this.type.bind(['room'], () => {
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
    };

    /**
     * Открытие расписания
     * @param  {string}   type тип расписания
     * @param  {object}   data данные о занятиях
     * @return {Switcher}      this
     */
    Switcher.prototype.openSchedule = function (type, data) {
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
                (new Schedule(type, data)).draw($('<div class="schedule"></div>').appendTo(system.$schedule));
                break;
        }

        system.showSchedule();

        return this;
    };

    /**
     * Закрытие расписания
     * @return {Switcher} this
     */
    Switcher.prototype.closeSchedule = function () {
        system.showIntro();

        return this;
    };


    /**
     * Конструктор класса Select
     * @param {string} id id блока селектора
     */
    var Select = function (id) {
        this.id = id;
        this.$select = $(`<select class="select" id="${id}"></select>`).appendTo(system.$switch);
    };

    /**
     * Создание пункта селектора
     * @param  {string} value      значение пункта
     * @param  {string} text       текст пункта
     * @param  {bool}   [disabled] пункт недоступен для выбора, если true
     * @return {jQuery}            блок пункта
     */
    Select.prototype.createOption = function (value, text, disabled) {
        return $(`<option value="${value}">${text}</option>`).prop('disabled', disabled);
    };

    /**
     * Заполнение селектора
     * @param  {string} text текст placeholder
     * @param  {object} data данные селектора
     * @return {Select}      this
     */
    Select.prototype.fill = function (text, data) {
        this.$select.html('');

        this.createOption('', text).appendTo(this.$select);
        data.forEach(item => this.createOption(item.value, item.text, item.disabled).appendTo(this.$select));

        let value = localStorage[this.id];
        if (value != null) {
            this.$select.find(`[value="${value}"]`).prop('selected', true);
            this.$select.trigger('change', [ true ]);
        }

        return this;
    };

    /**
     * Привязка функции к изменению селектора
     * @param  {array}    [values]  необходимое значение для вызова функции
     * @param  {function} callback  функция
     * @param  {object}   [thisArg] контекст функици
     * @return {Select}             this
     */
    Select.prototype.bind = function (values, callback, thisArg) {
        if (typeof values === 'function') {
            thisArg = callback;
            callback = values;
            values = null;
        }

        this.$select.change(function (event, param) {
            var selectValue = $(this).val();
            if (values == null || values.includes(selectValue)) {
                callback.call(thisArg, selectValue, param);
            }
        });

        return this;
    };

    /**
     * Отображение селектора
     * @return {Select} this
     */
    Select.prototype.show = function () {
        this.$select.show();

        return this;
    };

    /**
     * Скрытие селектора
     * @return {Select} this
     */
    Select.prototype.hide = function () {
        this.$select.hide();

        return this;
    };

    /**
     * Получить значение
     * @return {string} значение
     */
    Select.prototype.val = function () {
        return this.$select.val();
    };
})();
