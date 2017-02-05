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
                                $(this.$el).addClass('has-error');
                                setTimeout(() => $(this.$el).removeClass('has-error'), 3000);
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
                    tab: 'editTeachers',
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