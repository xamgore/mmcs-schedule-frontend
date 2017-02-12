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
                    newTeacher: {
                        name: '',
                        degree: '',
                    },
                },
                methods: {
                    shownOnce: function () {
                        this.tab = 'editTeachers';
                    },

                    editTeachers_insert(insertTeacher) {
                        let teachersPos = 0;
                        this.teachers.some((teacher, index) => {
                            if (teacher.name > insertTeacher.name && teacher.degree > insertTeacher.degree) {
                                teachersPos = index;
                                return true;
                            }
                        });
                        this.teachers.splice(teachersPos, 0, insertTeacher);
                    },
                    editTeachers_add: function () {
                        api.teacher.add(this.newTeacher.name, this.newTeacher.degree, id => {
                            if (id) {
                                this.editTeachers_insert({
                                    id: id,
                                    name: this.newTeacher.name,
                                    degree: this.newTeacher.degree,
                                });

                                this.newTeacher.name = '';
                                this.newTeacher.degree = '';

                                alerts.success('Преподаватель добавлен');
                            } else {
                                alerts.danger('Ошибка добаления преподавателя');
                            }
                        });
                    },
                    editTeachers_edit: function (teacher) {
                        teacher.old = JSON.parse(JSON.stringify(teacher));
                        
                        teacher.edit = true;

                        this.$forceUpdate();
                    },
                    editTeachers_save: function (teacher) {
                        let teachersPos = this.teachers.indexOf(teacher);

                        api.teacher.update(teacher.id, teacher.name, teacher.degree, success => {
                            if (success) {
                                this.teachers.splice(teachersPos, 1);
                                this.editTeachers_insert({
                                    id: teacher.id,
                                    name: teacher.name,
                                    degree: teacher.degree,
                                });

                                alerts.success('Преподаватель изменен');
                            } else {
                                alerts.danger('Ошибка изменения преподавателя');
                            }
                        });
                    },
                    editTeachers_cancel: function (teacher) {
                        let teachersPos = this.teachers.indexOf(teacher);

                        this.teachers[teachersPos] = teacher.old;

                        this.$forceUpdate();
                    },
                    editTeachers_delete: function (teacher) {
                        let teachersPos = this.teachers.indexOf(teacher);

                        api.teacher.delete(teacher.id, success => {
                            if (success) {
                                this.teachers.splice(teachersPos, 1);

                                alerts.success('Преподаватель удален');
                            } else {
                                alerts.danger('Ошибка удаления преподавателя');
                            }
                        });
                    },
                },
                watch: {
                    tab: function () {
                        switch (this.tab) {
                            case 'editTeachers':
                                this.teachers = [];
                                api.teacher.list(teachers => this.teachers = teachers);
                                break;
                        }
                    },
                },
            });

            api.auth.status(ok => ok ? this.enable() : this.disable());

            window.editor = this;

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