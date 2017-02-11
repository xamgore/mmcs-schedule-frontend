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
                query('time/week', null, 'get', result => callback(Number(result.type)));
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
             * Добавить преподавателя
             * @param {string}   name     ФИО
             * @param {string}   degree   Степень
             * @param {function} callback
             */
            add: (name, degree, callback) => query('teacher', {
                APIkey: localStorage.APIkey,
                name, degree,
            }, 'put', () => callback(true), () => callback(false)),
            /**
             * Изменить преподавателя
             * @param {string}   teacher  ID преподавателя
             * @param {string}   name     ФИО
             * @param {string}   degree   Степень
             * @param {function} callback
             */
            update: (teacher, name, degree, callback) => query(`teacher/{$teacher}`, {
                APIkey: localStorage.APIkey,
                name, degree,
            }, 'post', () => callback(true), () => callback(false)),
            /**
             * Удалить преподавателя
             * @param {string}   teacher  ID преподавателя
             * @param {function} callback
             */
            delete: (teacher, callback) => query(`teacher/{$teacher}`, {
                APIkey: localStorage.APIkey,
            }, 'delete', () => callback(true), () => callback(false)),
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
             * Добавить аудиторию
             * @param {string}   name     Название
             * @param {function} callback
             */
            add: (name, callback) => query('room', {
                APIkey: localStorage.APIkey,
                name,
            }, 'put', () => callback(true), () => callback(false)),
            /**
             * Изменить аудиторию
             * @param {string}   room     ID аудитории
             * @param {string}   name     Название
             * @param {function} callback
             */
            update: (room, name, callback) => query(`room/{$room}`, {
                APIkey: localStorage.APIkey,
                name,
            }, 'post', () => callback(true), () => callback(false)),
            /**
             * Удалить аудиторию
             * @param {string}   room     ID аудитории
             * @param {function} callback
             */
            delete: (room, callback) => query(`room/{$room}`, {
                APIkey: localStorage.APIkey,
            }, 'delete', () => callback(true), () => callback(false)),
            /**
             * Получить расписание аудитории
             * @param {string}   room     ID аудитории
             * @param {function} callback
             */
            schedule: (room, callback) => query(`APIv1/schedule/room/${room}`, null, 'get', callback, null),
        },
        // Секция курсов
        grade: {
            /**
             * Получить список курсов
             * @param {function} callback
             */
            list: callback => query('APIv1/grade/list', null, 'get', callback, null),
            /**
             * Добавить курс
             * @param {string}   num      Номер
             * @param {string}   degree   Степень обучния
             * @param {function} callback
             */
            add: (num, degree, callback) => query('APIv1/grade', {
                APIkey: localStorage.APIkey,
                num, degree,
            }, 'put', () => callback(true), () => callback(false)),
            /**
             * Изменить курс
             * @param {string}   grade    ID курса
             * @param {string}   num      Номер
             * @param {string}   degree   Степень обучния
             * @param {function} callback
             */
            update: (grade, num, degree, callback) => query(`APIv1/grade/{$grade}`, {
                APIkey: localStorage.APIkey,
                num, degree,
            }, 'post', () => callback(true), () => callback(false)),
            /**
             * Удалить курс
             * @param {string}   grade    ID курса
             * @param {function} callback
             */
            delete: (grade, callback) => query(`APIv1/grade/{$grade}`, {
                APIkey: localStorage.APIkey,
            }, 'delete', () => callback(true), () => callback(false)),
            /**
             * Получить расписание курса
             * @param {string}   grade    ID курса
             * @param {function} callback
             */
            schedule: (grade, callback) => {
                api.groups.list(grade, groups => {
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
             * @param {string}   grade    ID курса
             * @param {string}   day      ID дня
             * @param {function} callback
             */
            scheduleForDay: (grade, day, callback) => {
                api.grade.schedule(grade, data => callback({ 
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
             * @param {string}   grade    ID курса
             * @param {function} callback
             */
            list: (grade, callback) => query(`group/list/${grade}`, null, 'get', callback, null),
            /**
             * Добавить группу
             * @param {string}   num      Номер
             * @param {string}   name     Название
             * @param {string}   grade    ID курса
             * @param {function} callback
             */
            add: (num, name, grade, callback) => query('group', {
                APIkey: localStorage.APIkey,
                num, degree, grade,
            }, 'put', () => callback(true), () => callback(false)),
            /**
             * Изменить группу
             * @param {string}   group    ID группы
             * @param {string}   num      Номер
             * @param {string}   name     Название
             * @param {function} callback
             */
            update: (group, num, name, callback) => query(`group/{$group}`, {
                APIkey: localStorage.APIkey,
                num, name,
            }, 'post', () => callback(true), () => callback(false)),
            /**
             * Удалить группу
             * @param {string}   group    ID группы
             * @param {function} callback
             */
            delete: (group, callback) => query(`group/{$group}`, {
                APIkey: localStorage.APIkey,
            }, 'delete', () => callback(true), () => callback(false)),
            /**
             * Получить расписание группы
             * @param {string}   group    ID группы
             * @param {function} callback
             */
            schedule: (group, callback) => query(`schedule/group/${group}`, null, 'get', callback, null),
        },
        // Cекция предметов
        subject: {
            /**
             * Получить список предметов
             * @param {function} callback
             */
            list: callback => query('subject/list', null, 'get', callback, null),
            /**
             * Добавить предмет
             * @param {string}   name      Название
             * @param {string}   abbr      Сокращение
             * @param {function} callback
             */
            add: (name, abbr, callback) => query('subject', {
                APIkey: localStorage.APIkey,
                name, abbr,
            }, 'put', () => callback(true), () => callback(false)),
            /**
             * Изменить предмет
             * @param {string}   subject  ID предмета
             * @param {string}   name     Название
             * @param {string}   abbr     Сокращение
             * @param {function} callback
             */
            update: (subject, name, abbr, callback) => query(`subject/{$subject}`, {
                APIkey: localStorage.APIkey,
                name, abbr,
            }, 'post', () => callback(true), () => callback(false)),
            /**
             * Удалить предмет
             * @param {string}   subject  ID предмета
             * @param {function} callback
             */
            delete: (subject, callback) => query(`subject/{$subject}`, {
                APIkey: localStorage.APIkey,
            }, 'delete', () => callback(true), () => callback(false)),
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
     * @param {function} callback
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
