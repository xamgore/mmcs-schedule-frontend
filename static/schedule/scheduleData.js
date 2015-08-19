var menu = {};
var loader = {};


$(function () {
    'use strict';

    var degreeMap = {
        bachelor: '',
        master: 'Магистратура, ',
        specialist: 'Специалитет, '
    };

    var backendURL = window.document.location.protocol + '//' + window.document.location.hostname + ':3000/';

    menu.getJSON = function (route, callback) {
        $.getJSON(backendURL + route, {}, callback);
    };


    // =========================
    //  menu data loaders
    // =========================

    /**
     * @typedef {object} grade_t
     * @property {number} id
     * @property {number} num
     * @property {string} degree
     */
    /**
     * @callback gradeCallback
     * @param {group_t[]} currentWeek
     */
    /**
     * @param {gradeCallback} cb
     */
    loader.grades = function (cb) {
        menu.getJSON('grade/list', function (data) {
            cb(data);
        });
    };


    /**
     * @typedef {object} group_t
     * @property {number} id
     * @property {number} num
     * @property {number} gradeid
     * @property {string} [name]
     */
    /**
     * @callback groupCallback
     * @param {grade_t[]} gradeList
     */
    /**
     * @param {number} gradeID
     * @param {groupCallback} cb
     */
    loader.groups = function (gradeID, cb) {
        menu.getJSON('group/list/' + gradeID, function (data) {
            cb(data);
        });
    };


    /**
     * @typedef {object} subject_t
     * @property {number} id
     * @property {string} name
     * @property {string} abbr
     */
    /**
     * @callback subjectCallback
     * @param {subject_t[]} subjectList
     */
    /**
     * @param {subjectCallback} cb
     */
    loader.subjects = function (cb) {
        menu.getJSON('subject/list', function (data) {
            cb(data);
        });
    };


    /**
     * @typedef {object} room_t
     * @property {number} id
     * @property {string} name
     */
    /**
     * @callback roomCallback
     * @param {room_t[]} roomList
     */
    /**
     * @param {roomCallback} cb
     */
    loader.rooms = function (cb) {
        menu.getJSON('room/list', function (data) {
            cb(data);
        });
    };



    /**
     * @typedef {object} teacher_t
     * @property {number} id
     * @property {string} name
     * @property {string} degree
     */
    /**
     * @callback teacherCallback
     * @param {teacher_t[]} teacherList
     */
    /**
     * @param {teacherCallback} cb
     */
    loader.teachers = function (cb) {
        menu.getJSON('teacher/list', function (data) {
            cb(data);
        });
    };


    /**
     * @typedef {object} time_t
     * @property {number} [hours]
     * @property {number} [minutes]
     */
    /**
     * @typedef {object} lessonTime_t
     * @property {number} id
     * @property {number} num
     * @property {time_t} cbeg
     * @property {time_t} cend
     */
    /**
     * @callback timeCallback
     * @param {lessonTime_t[]} lessonTimes
     */
    /**
     * @param {timeCallback} cb
     */
    loader.times = function (cb) {
        menu.getJSON('time/list', function (data) {
            cb(data);
        });
    };


    /**
     * @callback weekCallback
     * @param {number} groupList
     */
    /**
     * @param {weekCallback} cb
     * @param {jQuery} $week
     */
    loader.week = function ($week, cb) {
        menu.getJSON('schedule/week', function (data) {
            var actualWeek = data.type ? 'верхняя неделя' : 'нижняя неделя'; // todo: extract
            $week.text('Сейчас ' + actualWeek);

            if (cb) {
                cb(data.type);
            }
        });
    };





    // =========================
    //      name generators
    // =========================


    /**
     * @param {grade_t} grade
     * @returns {string}
     */
    menu.gradeName = function (grade) {
        var degree = degreeMap[grade.degree];
        return degree + grade.num + ' курс ';
    };

    /**
     * @param {group_t} group
     * @returns {string}
     */
    menu.groupName = function (group) {
        var name = group.num + ' группа';
        if (group.name && group.name !== 'NULL') {
            return group.name + ', ' + name;
        }
        return name;
    };


    // =========================
    //  option generators
    // =========================

    /**
     * @param {grade_t} grade
     * @returns {string}
     */
    menu.gradeOption = function (grade) {
        return '<option value="' + grade.id + '">' + this.gradeName(grade) + '</option>';
    };


    /**
     * @param {group_t} group
     * @returns {string}
     */
    menu.groupOption = function (group) {
        return '<option value="' + group.id + '">' + menu.groupName(group) + '</option>';
    };


});
