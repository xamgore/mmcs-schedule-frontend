(() => {
    'use strict';

    let ulrPrefix = '//users.mmcs.sfedu.ru:3000/';

    window.api = {
        // Секция недели
        week: {
            /**
             * Получить неделю (верхняя/нижняя)
             * @param {function} callback
             */
            get: callback => {
                query('time/week', null, 'get', result => {
                    switch (Number(result.type)) {
                        case 0:
                            callback('upper');
                            break;

                        case 1:
                            callback('lower');
                            break;

                        default:
                            callback(null);
                    }
                });
            },
        },
        // Секция времен пар
        time: {
            /**
             * Получить список времен
             * @param {function} callback
             */
            list: callback => query('time/list', null, 'get', callback, null),
        },
        // Секция преподавателей
        teacher: {
            /**
             * Получить список преподавателей
             * @param {function} callback
             */
            list: callback => query('teacher/list', null, 'get', callback, null),
            /**
             * Получить расписание преподавателя
             * @param {string}   teacher  ID преподавателя
             * @param {function} callback
             */
            schedule: (teacher, callback) => query(`APIv1/schedule/teacher/${teacher}`, null, 'get', callback, null),
        },
        // Секция аудиторий
        room: {
            /**
             * Получить список аудиторий
             * @param {function} callback
             */
            list: callback => query('room/list', null, 'get', callback, null),
            /**
             * Получить расписание аудитории
             * @param {string}   room     ID аудитории
             * @param {function} callback
             */
            schedule: (room, callback) => query(`APIv1/schedule/room/${room}`, null, 'get', callback, null),
        },
        // Секция курсов
        course: {
            /**
             * Получить список курсов
             * @param {function} callback
             */
            list: callback => query('APIv1/grade/list', null, 'get', callback, null),
            /**
             * Получить расписание курса
             * @param {string}   course   ID курса
             * @param {function} callback [description]
             */
            schedule: (course, callback) => {
                api.groups.list(course, groups => {
                    let data = {
                        lessons: [],
                        curricula: [],
                        groups: groups,
                    };
                    let queryCount = 0;
                    data.groups.forEach(({ id }) => {
                        api.groups.schedule(id, ({ lessons, curricula }) => {
                            lessons.forEach(lesson => lesson.groupid = id);
                            Array.prototype.push.apply(data.lessons, lessons);
                            Array.prototype.push.apply(data.curricula, curricula);
                            queryCount++;
                            if (queryCount == data.groups.length) callback(data);
                        });
                    });
                });
            },
            /**
             * Получить расписание курса в день
             * @param {string}   course   ID курса
             * @param {string}   day      ID дня
             * @param {function} callback
             */
            scheduleForDay: (course, day, callback) => {
                api.course.schedule(course, data => callback({ 
                    lessons: data.lessons.filter(({ timeslot }) => timeslot[1] === day),
                    curricula: data.curricula,
                    groups: data.groups,
                }));
            },
        },
        // Секция групп
        groups: {
            /**
             * Получить список групп
             * @param {string}   course   ID курса
             * @param {function} callback
             */
            list: (course, callback) => query(`group/list/${course}`, null, 'get', callback, null),
            /**
             * Получить расписание группы
             * @param {string}   group    ID группы
             * @param {function} callback
             */
            schedule: (group, callback) => query(`schedule/group/${group}`, null, 'get', callback, null),
        },
        // Секция занятий
        lesson: {},
        // Секция авторизации
        auth: {
            /**
             * Узнать статус авторизации
             * @param {function} callback
             */
            status: callback => {
                query('APIv1/auth/status', {
                    APIKey: localStorage.APIKey
                }, 'get', ({ status }) => callback(status === 'manager'), null);
            },
            /**
             * Авторизоваться
             * @param {string}   login    Логин
             * @param {string}   pass     Пароль
             * @param {function} callback
             */
            login: (login, pass, callback) => {
                query('APIv1/auth/login', {
                    login: login,
                    pass: pass
                }, 'get', ({ APIKey }) => {
                    localStorage.APIKey = APIKey;
                    callback(true);
                }, () => callback(false));
            },
            /**
             * Выйти
             * @param {function} callback
             */
            logout: callback => {
                delete localStorage.APIKey;
                setTimeout(callback.bind(this), 0);
            },
        },
    };

    /**
     * Отправка запроса
     * @param {string}   url      Фдрес
     * @param {object}   data     Передаваемые данные
     * @param {string}   type     Тип запроса (post, get, pop)
     * @param {function} callback Функция, выполняющаяся при удачном запросе
     */
    let query = (url, data, type, callback, errback) => {
        data = data || {};
        type = type || 'post';
        callback = callback || (() => {});
        errback = errback || (() => {});

        $.ajax(ulrPrefix + url, {
            data: data,
            dataType: 'json',
            method: type.toUpperCase(),
            success: result => callback(result),
            error: () => errback(),
        });
    };
})();
