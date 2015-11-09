/* global system */
(function () {
    'use strict';

    window.api = {
        week: {
            get: function (callback, thisArg) {
                query('time/week', null, 'get', function(result) {
                    var week = Number(result.type);

                    if (week === 0) {
                        callback.call(thisArg, 'upper');
                    } else {
                        callback.call(thisArg, 'lower');
                    }
                });
            }
        },
        times: {
            get: function (callback, thisArg) {
                query('time/list', null, 'get', callback, thisArg);
            }
        },
        switcher: {
            getCourses: function (callback, thisArg) {
                query('grade/list', null, 'get', callback, thisArg);
            },
            getGroups: function (course, callback, thisArg) {
                query('group/list/' + course, null, 'get', callback, thisArg);
            },
            getTeachers: function (callback, thisArg) {
                query('teacher/list', null, 'get', callback, thisArg);
            }
        },
        schedule: {
            getForGroup: function (group, callback, thisArg) {
                query('schedule/group/' + group, null, 'get', callback, thisArg);
            },
            getForTeacher: function (teacher, callback, thisArg) {
                query('schedule/teacher/' + teacher, null, 'get', callback, thisArg);
            }
        }
    };

    /**
     * Отправка запроса
     * @param  {string}   url      адрес
     * @param  {object}   data     передаваемые данные
     * @param  {string}   type     тип запроса (post, get, pop)
     * @param  {function} callback функция, выполняющаяся при удачном запросе
     * @param  {object}   thisArg  контекст callback
     */
    var query = function (url, data, type, callback, thisArg) {
        data = data || {};
        type = ['post', 'get', 'pop'].indexOf(type) !== -1 ? type : 'post';
        callback = callback || function (){};

        $.ajax(system.getUrl(url), {
            data: data,
            method: type.toUpperCase(),
            success: function (result) {
                callback.call(thisArg, result);
            }
        });
    };
}());
