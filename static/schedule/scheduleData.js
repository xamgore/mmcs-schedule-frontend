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


    /**
     * @typedef {object} grade_t
     * @property {number} id
     * @property {number} num
     * @property {string} degree
     */

    /**
     * @typedef {object} group_t
     * @property {number} id
     * @property {number} num
     * @property {number} gradeid
     * @property {string} [name]
     */

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
     * @param {object} grade
     * @param {number} grade.id
     * @param {number} grade.num
     * @param {string} grade.degree
     * @returns {string}
     */
    menu.gradeOption = function (grade) {
        return '<option value="' + grade.id + '">' + this.gradeName(grade) + '</option>';
    };


    /**
     * @param {object} group
     * @param {number} group.id
     * @param {number} group.num
     * @param {string} [group.name]
     * @returns {string}
     */
    menu.groupOption = function (group) {
        return '<option value="' + group.id + '">' + menu.groupName(group) + '</option>';
    };


    // =========================
    //  menu data loaders
    // =========================


    /**
     * @param {jQuery} $gradeList
     */
    loader.grades = function ($gradeList) {
        menu.getJSON('grade/list', function (data) {
            console.log(arguments[0]);

            $gradeList.html('<option value="0">Выберите курс:</option>'); // Сначала чистим select
            $.each(data, function (i, gradeInfo) {
                $gradeList.append(menu.gradeOption(gradeInfo));
            });
        });
    };

    /**
     * @param {number} gradeID
     * @param {jQuery} $groupList
     */
    loader.groups = function (gradeID, $groupList) {
        menu.getJSON('group/list/' + gradeID, function (data) {
            console.log(arguments[0]);
            $groupList.html('<option value="0">Выберите группу:</option>'); // Сначала чистим select
            $.each(data, function (i, groupInfo) {
                $groupList.append(menu.groupOption(groupInfo));
            });
        });
    };


    /**
     * @callback weekCallback
     * @param {number} currentWeek
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


});
