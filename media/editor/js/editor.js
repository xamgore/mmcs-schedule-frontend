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

                    rooms: [],
                    newRoom: {
                        name: '',
                    },

                    grades: [],
                    gradeDegrees: [ {
                        id: 'bachelor',
                        text: 'Бакалавриат',
                    }, {
                        id: 'master',
                        text: 'Магистратура',
                    }, {
                        id: 'postgraduate',
                        text: 'Асписрантура',
                    } ],
                    gradeDegreesSelect: [],
                    newGrade: {
                        num: '',
                        degree: 'bachelor',
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

                    editRooms_insert(insertRoom) {
                        let roomsPos = 0;
                        this.rooms.some((room, index) => {
                            if (room.name > insertRoom.name) {
                                roomsPos = index;
                                return true;
                            }
                        });
                        this.rooms.splice(roomsPos, 0, insertRoom);
                    },
                    editRooms_add: function () {
                        api.room.add(this.newRoom.name, id => {
                            if (id) {
                                this.editRooms_insert({
                                    id: id,
                                    name: this.newRoom.name,
                                });

                                this.newRoom.name = '';

                                alerts.success('Аудитория добавлена');
                            } else {
                                alerts.danger('Ошибка добаления аудитории');
                            }
                        });
                    },
                    editRooms_edit: function (room) {
                        room.old = JSON.parse(JSON.stringify(room));
                        
                        room.edit = true;

                        this.$forceUpdate();
                    },
                    editRooms_save: function (room) {
                        let roomsPos = this.rooms.indexOf(room);

                        api.room.update(room.id, room.name, success => {
                            if (success) {
                                this.rooms.splice(roomsPos, 1);
                                this.editRooms_insert(JSON.parse(JSON.stringify(room)));

                                alerts.success('Аудитория изменена');
                            } else {
                                alerts.danger('Ошибка изменения аудитории');
                            }
                        });
                    },
                    editRooms_cancel: function (room) {
                        let roomsPos = this.rooms.indexOf(room);

                        this.rooms[roomsPos] = room.old;

                        this.$forceUpdate();
                    },
                    editRooms_delete: function (room) {
                        let roomsPos = this.rooms.indexOf(room);

                        api.room.delete(room.id, success => {
                            if (success) {
                                this.rooms.splice(roomsPos, 1);

                                alerts.success('Аудитория удалена');
                            } else {
                                alerts.danger('Ошибка удаления аудитории');
                            }
                        });
                    },

                    editGrades_insert(insertGrade) {
                        let gradesPos = 0;
                        this.grades.some((grade, index) => {
                            if (grade.num > insertGrade.num && grade.degree > insertGrade.degree) {
                                gradesPos = index;
                                return true;
                            }
                        });
                        this.grades.splice(gradesPos, 0, insertGrade);
                    },
                    editGrages_getDegree(degreeID) {
                        let degreeName = '';
                        this.gradeDegrees.some(degree => {
                            if (degree.id === degreeID) {
                                degreeName = degree.text;
                                return true;
                            }
                        });
                        return degreeName;
                    },
                    editGrades_add: function () {
                        api.grade.add(this.newGrade.num, this.newGrade.degree, id => {
                            if (id) {
                                this.editGrades_insert({
                                    id: id,
                                    num: this.newGrade.num,
                                    degree: this.newGrade.degree,
                                });

                                this.newGrade.num = '';
                                this.newGrade.degree = '';

                                alerts.success('Курс добавлен');
                            } else {
                                alerts.danger('Ошибка добаления курса');
                            }
                        });
                    },
                    editGrades_edit: function (grade) {
                        grade.old = JSON.parse(JSON.stringify(grade));
                        
                        grade.edit = true;

                        this.$forceUpdate();
                    },
                    editGrades_save: function (grade) {
                        let gradesPos = this.grades.indexOf(grade);

                        api.grade.update(grade.id, grade.num, grade.degree, success => {
                            if (success) {
                                this.grades.splice(gradesPos, 1);
                                this.editGrades_insert({
                                    id: grade.id,
                                    num: grade.num,
                                    degree: grade.degree,
                                });

                                alerts.success('Курс изменен');
                            } else {
                                alerts.danger('Ошибка изменения курса');
                            }
                        });
                    },
                    editGrades_cancel: function (grade) {
                        let gradesPos = this.grades.indexOf(grade);

                        this.grades[gradesPos] = grade.old;

                        this.$forceUpdate();
                    },
                    editGrades_delete: function (grade) {
                        let gradesPos = this.grades.indexOf(grade);

                        api.grade.delete(grade.id, success => {
                            if (success) {
                                this.grades.splice(gradesPos, 1);

                                alerts.success('Курс удален');
                            } else {
                                alerts.danger('Ошибка удаления курса');
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

                            case 'editRooms':
                                this.rooms = [];
                                api.room.list(rooms => this.rooms = rooms);
                                break;

                            case 'editGrades':
                                this.grades = [];
                                api.grade.list(grades => this.grades = grades);
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