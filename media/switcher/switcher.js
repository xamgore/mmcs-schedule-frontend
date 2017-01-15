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
        this.teacher = new Select('teacher').hide();
        this.room = new Select('room').hide();

        // Действие при сбросе выбора типа расписания
        this.type.bind([''], function () {
            this.course.hide();
            this.group.hide();
            this.teacher.hide();
            this.room.hide();
            this.closeSchedule();
        }, this);

        // Действие при выборе группы в типе расписания
        this.type.bind(['course', 'group'], function () {
            this.course.hide();
            this.group.hide();
            this.teacher.hide();
            this.room.hide();

            api.switcher.getCourses(function (result) {
                var degreeMap = {
                    bachelor: '',
                    master: 'Магистратура, '
                };

                this.course.fill('Выберите курс', result.map(function (course) {
                    return {
                        value: course.id,
                        text: degreeMap[course.degree] + course.num + ' курс'
                    };
                }, this)).show();
            }, this);
        }, this);

        // Действие при выборе курса
        this.course.bind(function (course) {
            this.group.hide();

            if (course === '') {
                this.closeSchedule();
                return;
            }

            switch (this.type.val()) {
                case 'course':
                    /*api.schedule.getForCourse(course, function (result) {
                        this.openSchedule('course', result);
                    }, this);*/
                    break;

                case 'group':
                    api.switcher.getGroups(course, function (result) {
                        this.group.fill('Выберите группу', result.map(function (group) {
                            var name = group.num + ' группа';
                            if (group.name && group.name !== 'NULL') {
                                name = group.name + ', ' + name;
                            }

                            return {
                                value: group.id,
                                text: name
                            };
                        }, this)).show();
                    }, this);
                    break;
            }
        }, this);

        // Действие при выборе группы
        this.group.bind(function (group) {
            if (group === '') {
                this.closeSchedule();
                return;
            }

            api.schedule.getForGroup(group, function (result) {
                this.openSchedule('group', result);
            }, this);
        }, this);

        // Действие при выборе преподавателя в типе расписания
        this.type.bind(['teacher'], function () {
            this.course.hide();
            this.group.hide();
            this.teacher.hide();
            this.room.hide();

            api.switcher.getTeachers(function (result) {
                this.teacher.fill('Выберите преподавателя', result.map(function (teacher) {
                    return {
                        value: teacher.id,
                        text: teacher.name
                    };
                }, this)).show();
            }, this);
        }, this);

        // Действие при выборе преподавателя
        this.teacher.bind(function (teacher) {
            if (teacher === '') {
                this.closeSchedule();
                return;
            }

            api.schedule.getForTeacher(teacher, function (result) {
                this.openSchedule('teacher', result);
            }, this);
        }, this);

        // Действие при выборе аудитории в типе расписания
        this.type.bind(['room'], function () {
            this.course.hide();
            this.group.hide();
            this.teacher.hide();
            this.room.hide();

            api.switcher.getRooms(function (result) {
              this.room.fill('Выберите Аудиторию', result.map(function (room) {
                    return {
                        value: room.id,
                        text: room.name
                    };
                }, this)).show();
            }, this);
        }, this);

        // Действие при выборе аудитории
        this.room.bind(function (room) {
            if (room === '') {
                this.closeSchedule();
                return;
            }

            api.schedule.getForTeacher(room, function (result) {
                this.openSchedule('room', result);
            }, this);
        }, this);

        // localStorage
        this.type.bind(function(type, init) {
            localStorage.type = type;
            if (!init) {
                localStorage.course = '';
                localStorage.teacher = '';
            }
        });
        this.course.bind(function(course, init) {
            localStorage.course = course;
            if (!init || localStorage.type !== 'group') {
                localStorage.group = '';
            }
        });
        this.group.bind(function(group) {
            localStorage.group = group;
        });
        this.teacher.bind(function(teacher) {
            localStorage.teacher = teacher;
        });
        this.room.bind(function(room) {
            localStorage.room = room;
        });

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
        if (this.schedule) {
            this.schedule.destruct();
        }

        this.schedule = new Schedule(system.$schedule, type, data);
        this.schedule.draw();
        system.showSchedule();

        return this;
    };

    /**
     * Закрытие расписания
     * @return {Switcher} this
     */
    Switcher.prototype.closeSchedule = function () {
        if (this.schedule) {
            this.schedule.destruct();
            this.schedule = null;
        }

        system.showIntro();

        return this;
    };


    /**
     * Конструктор класса Select
     * @param {string} id id блока селектора
     */
    var Select = function (id) {
        this.id = id;
        this.$select = $('<select class="select" id="' + this.id + '"></select>').appendTo(system.$switch);
    };

    /**
     * Создание пункта селектора
     * @param  {string} value      значение пункта
     * @param  {string} text       текст пункта
     * @param  {bool}   [disabled] пункт недоступен для выбора, если true
     * @return {jQuery}            блок пункта
     */
    Select.prototype.createOption = function (value, text, disabled) {
        return $('<option value="' + value + '">' + text + '</option>').prop('disabled', disabled);
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
        data.forEach(function (item) {
            this.createOption(item.value, item.text, item.disabled).appendTo(this.$select);
        }, this);

        if (localStorage[this.id]) {
            this.$select.find('[value="' + localStorage[this.id] + '"]').prop('selected', true);
            this.$select.trigger("change", [ true ]);
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
     * Скрытие селектора
     * @return {string} Значение
     */
    Select.prototype.val = function () {
        return this.$select.val();
    };
})();
