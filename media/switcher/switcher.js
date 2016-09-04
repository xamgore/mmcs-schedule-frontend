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
        this.auditory = new Select('auditory').hide();
        this.day = new Select('day').hide();

        // Заполнение селектора типа расписания
        this.type.fill('Тип расписания', [ {
            value: 'group',
            text: 'Группа'
        }, {
            value: 'teacher',
            text: 'Преподаватель'
        }, {
            value: 'auditory',
            text: 'Аудитория',
            disabled: true
        }, {
            value: 'chair',
            text: 'Кафедра',
            disabled: true
        }, {
            value: 'session',
            text: 'Сессия',
            disabled: true
        } ]);

        // Заполение селектора дня
        this.day.fill('День', [ {
            value: '1',
            text: 'Понедельник'
        }, {
            value: '2',
            text: 'Вторник'
        }, {
            value: '3',
            text: 'Среда'
        }, {
            value: '4',
            text: 'Четверг'
        }, {
            value: '5',
            text: 'Пятница'
        }, {
            value: '6',
            text: 'Суббота'
        } ]);

        // Действие при сбросе выбора типа расписания
        this.type.bind('', function () {
            this.course.hide();
            this.group.hide();
            this.teacher.hide();
            this.auditory.hide();
            this.day.hide();
            this.closeSchedule();
        }, this);

        // Действие при выборе группы в типе расписания
        this.type.bind('group', function () {
            api.switcher.getCourses(function (result) {
                var degreeMap = {
                    bachelor: '',
                    master: 'Магистратура, '
                };

                this.group.hide();
                this.teacher.hide();
                this.auditory.hide();
                this.day.hide();

                this.course.fill('Выберите курс', result.map(function (item) {
                    return {
                        value: item.id,
                        text: degreeMap[item.degree] + item.num + ' курс'
                    };
                }, this)).show();
            }, this);
        }, this);

        // Действие при выборе курса
        this.course.bind(function (course) {
            if (course === '') {
                this.group.hide();
                this.closeSchedule();
                return;
            }

            api.switcher.getGroups(course, function (result) {
                this.group.fill('Выберите группу', result.map(function (item) {
                    var name = item.num + ' группа';
                    if (item.name && item.name !== 'NULL') {
                        name = item.name + ', ' + name;
                    }

                    return {
                        value: item.id,
                        text: name
                    };
                }, this)).show();
            }, this);
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
        this.type.bind('teacher', function () {
            api.switcher.getTeachers(function (result) {
                this.course.hide();
                this.group.hide();
                this.teacher.hide();
                this.auditory.hide();
                this.day.hide();

                this.teacher.fill('Выберите преподавателя', result.map(function (item) {
                    return {
                        value: item.id,
                        text: item.name
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

        // Отображенеи селектора типа расписания
        this.type.show();

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
        this.$select = $('<select class="select" id="' + id + '"></select>').appendTo(system.$switch);
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
        data.forEach(function(item) {
            this.createOption(item.value, item.text, item.disabled).appendTo(this.$select);
        }, this);

        return this;
    };

    /**
     * Привязка функции к изменению селектора
     * @param  {string}   [value]   необходимое значение для вызова функции
     * @param  {function} callback  функция
     * @param  {object}   [thisArg] кнонтекст функици
     * @return {Select}             this
     */
    Select.prototype.bind = function (value, callback, thisArg) {
        if (typeof value === 'function') {
            thisArg = callback;
            callback = value;
            value = null;
        }

        this.$select.change(function () {
            var selectValue = $(this).val();
            if (selectValue === value || value == null) {
                callback.call(thisArg, selectValue);
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
})();
