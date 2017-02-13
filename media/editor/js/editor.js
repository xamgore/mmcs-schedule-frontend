(() => {
    'use strict';

    class Editor {
        /**
         * Инициализация
         */
        set() {
            this.setConstrols();
            this.setAuth();
            this.setEdit();
            this.setStatus();

            return this;
        }

        /**
         * Инициализация панели
         */
        setConstrols() {
            let editor = this;

            editor.controls = new Vue({
                el: '#editControl',
                data: {
                    enabled: false,
                    disabled: false,
                },
                methods: {
                    logout: function () {
                        api.auth.logout(() => editor.disable());
                    },
                },
            });

            return this;
        }

        /**
         * Инициализация окна авторизации
         */
        setAuth() {
            let editor = this;

            editor.auth = new Vue({
                el: '#authModal',
                data: {
                    login: '',
                    pass: '',
                },
                methods: {
                    submit: function () {
                        api.auth.login(this.login, this.pass, success => {
                            if (success) {
                                editor.enable();
                                $(this.$el).modal('hide');
                            } else {
                                alerts.danger('Неверный логин или пароль')
                            }
                        });
                    },
                    shown: function () {
                        $(this.$el).find('#authLogin').focus();
                    },
                },
            });

            return this;
        }

        /**
         * Инициализация окна редактирования
         */
        setEdit() {
            let editor = this;

            let tabs = [ {
                id: 'teacher',
                title: 'Преподаватели',

                defaultData: true,
                customData: {},
                fields: [ 'name', 'degree' ],
                defaultValues: {
                    name: '',
                    degree: '',
                },

                defaultMethods: true,
                customMethods: {},
                messages: {
                    addSusccess: 'Преподаватель добавлен',
                    addError: 'Ошибка добаления преподавателя',
                    editSusccess: 'Преподаватель изменен',
                    editError: 'Ошибка изменения преподавателя',
                    delteSusccess: 'Преподаватель удален',
                    deleteError: 'Ошибка удаления преподавателя',
                },
            
                loadTab: null,
            }, {
                id: 'room',
                title: 'Аудитории',

                defaultData: true,
                customData: {},
                fields: [ 'name' ],
                defaultValues: {
                    name: '',
                },

                defaultMethods: true,
                customMethods: {},
                messages: {
                    addSusccess: 'Аудитория добавлена',
                    addError: 'Ошибка добаления аудитории',
                    editSusccess: 'Аудитория изменена',
                    editError: 'Ошибка изменения аудитории',
                    delteSusccess: 'Аудитория удалена',
                    deleteError: 'Ошибка удаления аудитории',
                },
            
                loadTab: null,
            }, {
                id: 'grade',
                title: 'Курсы',

                defaultData: true,
                customData: {
                    gradeDegrees: {
                        'bachelor': 'Бакалавриат',
                        'master': 'Магистратура',
                        'postgraduate': 'Асписрантура',
                    },
                    gradeDegreesSelect: [ {
                        id: 'bachelor',
                        text: 'Бакалавриат',
                    }, {
                        id: 'master',
                        text: 'Магистратура',
                    }, {
                        id: 'postgraduate',
                        text: 'Асписрантура',
                    } ],
                },
                fields: [ 'num', 'degree' ],
                defaultValues: {
                    num: '',
                    degree: 'bachelor',
                },

                defaultMethods: true,
                customMethods: {},
                messages: {
                    addSusccess: 'Курс добавлен',
                    addError: 'Ошибка добаления курса',
                    editSusccess: 'Курс изменен',
                    editError: 'Ошибка изменения курса',
                    delteSusccess: 'Курс удален',
                    deleteError: 'Ошибка удаления курса',
                },
            
                loadTab: null,
            }, {
                id: 'group',
                title: 'Группы',

                defaultData: true,
                customData: {
                    groupGrades: {},
                    groupGradesSelect: [],
                },
                fields: [ 'num', 'name', 'grade' ],
                defaultValues: {
                    num: '',
                    name: '',
                    gradeid: '1'
                },

                defaultMethods: true,
                customMethods: {},
                messages: {
                    addSusccess: 'Группа добавлена',
                    addError: 'Ошибка добаления группы',
                    editSusccess: 'Группа изменена',
                    editError: 'Ошибка изменения группы',
                    delteSusccess: 'Группа удалена',
                    deleteError: 'Ошибка удаления группы',
                },
            
                loadTab: function () {
                    this.grades = [];
                    api.grade.list(grades => {
                        this.grades = grades;

                        this.groupGrades = {};
                        this.groupGradesSelect = [];
                        this.grades.forEach(grade => {
                            this.groupGrades[grade.id] = grade.name;
                            this.groupGradesSelect.push({
                                id: grade.id,
                                text: grade.name,
                            });
                        });

                        this.newGroup.gradeid = '1';
                    });

                    this.groups = [];
                    api.group.list(groups => this.groups = groups);
                },
            }, {
                id: 'subject',
                title: 'Предметы',

                defaultData: true,
                fields: [ 'name', 'abbr' ],
                defaultValues: {
                    name: '',
                    abbr: '',
                },
                customData: {},

                defaultMethods: true,
                messages: {
                    addSusccess: 'Предмет добавлен',
                    addError: 'Ошибка добаления предмета',
                    editSusccess: 'Предмет изменен',
                    editError: 'Ошибка изменения предмета',
                    delteSusccess: 'Предмет удален',
                    deleteError: 'Ошибка удаления предмета',
                },
                customMethods: {},
            
                loadTab: null,
            } ];

            function tabID(tab) {
                return `edit${helpers.firstUpper(tab.id)}s`;
            }

            let data = {
                tab: '',
                tabs: tabs.map(tab => ({
                    id: tabID(tab),
                    title: tab.title,
                })),
            };
            let methods = {
                show: function() {
                    this[`${this.tab}_load`]();
                },
                showOnce: function () {
                    this.tab = tabID(tabs[0]);
                },
                _load: function () {},
            };

            tabs.forEach(tab => {
                let name = tab.id;
                let listName = `${tab.id}s`;
                let newName = `new${helpers.firstUpper(tab.id)}`;
                let methodsPrefix = `${tabID(tab)}_`;

                if (tab.defaultData) {
                    data[listName] = [];
                    data[newName] = JSON.parse(JSON.stringify(tab.defaultValues));
                }
                Object.keys(tab.customData).forEach(key => data[key] = tab.customData[key]);

                if (tab.defaultMethods) {
                    methods[`${methodsPrefix}add`] = function () {
                        let args = tab.fields.map(field => this[newName][field]);
                        args.push(id => {
                            if (id) {
                                this[newName].id = id;
                                this[listName].unshift(this[newName]);

                                this[newName] = JSON.parse(JSON.stringify(tab.defaultValues));

                                alerts.success(tab.messages.addSusccess);
                            } else {
                                alerts.danger(tab.messages.addError);
                            }
                        });

                        api[name].add.apply(api[name], args);
                    };
                    methods[`${methodsPrefix}edit`] = function (item) {
                        item.old = JSON.parse(JSON.stringify(item));
                        item.edit = true;
                        this.$forceUpdate();
                    };
                    methods[`${methodsPrefix}save`] = function (item) {
                        let args = [ 'id' ].concat(tab.fields).map(field => item[field]);
                        args.push(success => {
                            if (success) {
                                item.edit = false;
                                this.$forceUpdate();

                                alerts.success(tab.messages.editSusccess);
                            } else {
                                alerts.danger(tab.messages.editError);
                            }
                        });

                        api[name].update.apply(api[name], args);
                    };
                    methods[`${methodsPrefix}cancel`] = function (item) {
                        this[listName].splice(this[listName].indexOf(item), 1, item.old);
                    };
                    methods[`${methodsPrefix}delete`] = function (item) {
                        api[name].delete(item.id, success => {
                            if (success) {
                                this[listName].splice(this[listName].indexOf(item), 1);

                                alerts.success(tab.messages.deleteSusccess);
                            } else {
                                alerts.danger(tab.messages.deleteError);
                            }
                        });
                    };
                }
                methods[`${methodsPrefix}load`] = tab.loadTab || function () {
                    this[listName] = [];
                    api[name].list(result => this[listName] = result);
                };
                Object.keys(tab.customMethods).forEach(key => methods[methodsPrefix + key] = tab.customMethods[key]);
            });

            editor.edit = new Vue({
                el: '#editModal',
                data, methods,
                watch: {
                    tab: function () {
                        this[`${this.tab}_load`]();
                    },
                },
            });

            window.edit = editor.edit;

            return this;
        }

        setStatus() {
            api.auth.status(ok => ok ? this.enable() : this.disable());

            return this;
        }

        /**
         * Включить редактор
         * @return {Editor} this
         */
        enable() {
            this.controls.enabled = true;
            this.controls.disabled = false;

            return this;
        }

        /**
         * Выключить редактор
         * @return {Editor} this
         */
        disable() {
            this.controls.enabled = false;
            this.controls.disabled = true;

            return this;
        }
    }

    window.Editor = Editor;
})();