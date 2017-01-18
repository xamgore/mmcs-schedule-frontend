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
                query('time/list', null, 'get', callback, null, thisArg);
            }
        },
        switcher: {
            getCourses: function (callback, thisArg) {
                query('grade/list', null, 'get', callback, null, thisArg);
            },
            getGroups: function (course, callback, thisArg) {
                query('group/list/' + course, null, 'get', callback, null, thisArg);
            },
            getTeachers: function (callback, thisArg) {
                query('teacher/list', null, 'get', callback, null, thisArg);
            },
            getRooms: function (callback, thisArg) {
                query('room/list', null, 'get', callback, null, thisArg);
            }
        },
        schedule: {
            getForGroup: function (group, callback, thisArg) {
                query('schedule/group/' + group, null, 'get', callback, null, thisArg);
            },
            getForTeacher: function (teacher, callback, thisArg) {
                query('schedule/teacher/' + teacher, null, 'get', callback, null, thisArg);
            },
            getForRoom: function (room, callback, thisArg) {
                query('schedule/room/' + room, null, 'get', callback, null, thisArg);
            },
            getForCourse: function (course, callback, thisArg) {
                api.switcher.getGroups(course, groups => {
                    let data = {
                        lessons: [],
                        curricula: [],
                        groups: groups,
                    };
                    let queryCount = 0;
                    data.groups.forEach(({ id }) => {
                        api.schedule.getForGroup(id, ({ lessons, curricula }) => {
                            lessons.forEach(lesson => lesson.groupid = id);
                            Array.prototype.push.apply(data.lessons, lessons);
                            Array.prototype.push.apply(data.curricula, curricula);
                            queryCount++;
                            if (queryCount == data.groups.length) {
                                callback.call(thisArg, data);
                            }
                        });
                    });
                });
            },
            getForDay: function (course, day, callback, thisArg) {
                api.switcher.getForCourse(course, data => {
                    callback.call(thisArg, { 
                        lessons: data.lessons.filter(({ timeslot }) => timeslot[1] == day),
                        curricula: data.curricula,
                        groups: data.groups,
                    });
                });
            }
        },
        auth: {
            status: function (callback, thisArg) {
                query('APIv1/auth/status', {
                  APIKey: system.getAPIKey
                }, 'get', callback, null, thisArg);
            },
            login: function (login, pass, callback, thisArg) {
                query('APIv1/auth/login', {
                    login: login,
                    pass: pass
                }, 'get', function () {
                    // system.setAPIKey('APIKEY');
                    callback.call(thisArg, true);
                }, function () {
                    callback.call(thisArg, false);
                });
            },
            logout: function (callback, thisArg) {
                query('auth/logout', null, 'get', callback, null, thisArg);
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
    var query = function (url, data, type, callback, errback, thisArg) {
        data = data || {};
        type = ['post', 'get', 'pop'].indexOf(type) !== -1 ? type : 'post';
        callback = callback || function () {};
        errback = errback || function () {};

        $.ajax(system.getUrl(url), {
            data: data,
            dataType: 'json',
            method: type.toUpperCase(),
            success: function (result) {
                callback.call(thisArg, result);
            },
            error: function () {
                errback.call(thisArg);
            }
        });
    };
}());
