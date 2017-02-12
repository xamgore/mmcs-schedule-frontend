(() => {
    'use strict';

    class Editor {
        /**
         * Получение статуса и настройка панели
         * @return {Editor} this
         */
        set() {
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

            editor.edit = new Vue({
                el: '#editModal',
                data: {
                    tab: '',
                    tabs: [ {
                        id: 'editTeachers',
                        title: 'Преподаватели',
                    }, {
                        id: 'editRooms',
                        title: 'Аудитории',
                    }, {
                        id: 'editGrades',
                        title: 'Курсы',
                    }, {
                        id: 'editGroups',
                        title: 'Группы',
                    }, {
                        id: 'editSubjects',
                        title: 'Предметы',
                    }, {
                        id: 'editLessons',
                        title: 'Занятия',
                    } ],

                    teachers: [],
                },
                methods: {
                    shownTab: function (id) {
                        switch (id) {
                            case 'editTeachers':
                                this.teachers = [];
                                api.teacher.list(teachers => this.teachers = teachers);
                                break;
                        }
                    },
                },
            });

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