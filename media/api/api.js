/* global system */
(() => {
    'use strict';

    window.api = {
        week: {
            get: callback => {
                query('time/week', null, 'get', result => {
                    let week = Number(result.type);

                    if (week === 0) {
                        callback('upper');
                    } else {
                        callback('lower');
                    }
                });
            },
        },
        times: {
            get: callback => query('time/list', null, 'get', callback, null),
        },
        switcher: {
            getCourses: callback => query('APIv1/grade/list', null, 'get', callback, null),
            getGroups: (course, callback) => query('group/list/' + course, null, 'get', callback, null),
            getTeachers: callback => query('teacher/list', null, 'get', callback, null),
            getRooms: callback => query('room/list', null, 'get', callback, null),
        },
        schedule: {
            getForGroup: (group, callback) => query('schedule/group/' + group, null, 'get', callback, null),
            getForTeacher: (teacher, callback) => query('APIv1/schedule/teacher/' + teacher, null, 'get', callback, null),
            getForRoom: (room, callback) => query('schedule/room/' + room, null, 'get', callback, null),
            getForCourse: (course, callback) => {
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
                            if (queryCount == data.groups.length) callback(data);
                        });
                    });
                });
            },
            getForDay: (course, day, callback) => {
                api.schedule.getForCourse(course, data => {
                    callback({ 
                        lessons: data.lessons.filter(({ timeslot }) => timeslot[1] === day),
                        curricula: data.curricula,
                        groups: data.groups,
                    });
                });
            },
        },
        auth: {
            status: callback => {
                query('APIv1/auth/status', {
                    APIKey: localStorage.APIKey
                }, 'get', ({ status }) => callback(status === 'manager'), null);
            },
            login: (login, pass, callback) => {
                query('APIv1/auth/login', {
                    login: login,
                    pass: pass
                }, 'get', ({ APIKey }) => {
                    localStorage.APIKey = APIKey;
                    callback(true);
                }, () => callback(false));
            },
            logout: callback => {
                query('auth/logout', null, 'get', () => {
                    delete localStorage.APIKey;
                    callback();
                }, null);
            },
        },
    };

    /**
     * Отправка запроса
     * @param  {string}   url      адрес
     * @param  {object}   data     передаваемые данные
     * @param  {string}   type     тип запроса (post, get, pop)
     * @param  {function} callback функция, выполняющаяся при удачном запросе
     */
    let query = (url, data, type, callback, errback) => {
        data = data || {};
        type = type || 'post';
        callback = callback || (() => {});
        errback = errback || (() => {});

        $.ajax(system.getUrl(url), {
            data: data,
            dataType: 'json',
            method: type.toUpperCase(),
            success: result => callback(result),
            error: () => errback(),
        });
    };
})();
