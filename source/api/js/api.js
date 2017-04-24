(() => {
    'use strict';

    let ulrPrefix = '/APIv1/';

    window.api = {
        // Секция недели
        week: {
            /**
             * Получить неделю
             * @param {function} callback
             */
            get: callback => query('week', null, 'get', result => callback(Number(result.week)), null),
            /**
             * Задать верхнюю неделю
             * @param {number}   day      День
             * @param {number}   month    Месяц
             * @param {number}   year     Год
             * @param {function} callback
             */
            set: (day, month, year, callback) => query('week', { day, month, year }, 'post', () => callback(true), () => callback(false)),
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
            add: (name, degree, callback) => query('teacher', { name, degree }, 'put', result => callback(result.res), () => callback(null)),
            /**
             * Изменить преподавателя
             * @param {string}   teacher  ID преподавателя
             * @param {string}   name     ФИО
             * @param {string}   degree   Степень
             * @param {function} callback
             */
            update: (teacher, name, degree, callback) => query(`teacher/${teacher}`, { name, degree }, 'post', () => callback(true), () => callback(false)),
            /**
             * Удалить преподавателя
             * @param {string}   teacher  ID преподавателя
             * @param {function} callback
             */
            delete: (teacher, callback) => query(`teacher/${teacher}`, null, 'delete', () => callback(true), () => callback(false)),
            /**
             * Получить расписание преподавателя
             * @param {string}   teacher  ID преподавателя
             * @param {function} callback
             */
            schedule: (teacher, callback) => query(`schedule/teacher/${teacher}`, null, 'get', callback, null),
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
            add: (name, callback) => query('room', { name } , 'put', result => callback(result.res), () => callback(null)),
            /**
             * Изменить аудиторию
             * @param {string}   room     ID аудитории
             * @param {string}   name     Название
             * @param {function} callback
             */
            update: (room, name, callback) => query(`room/${room}`, { name }, 'post', () => callback(true), () => callback(false)),
            /**
             * Удалить аудиторию
             * @param {string}   room     ID аудитории
             * @param {function} callback
             */
            delete: (room, callback) => query(`room/${room}`, null, 'delete', () => callback(true), () => callback(false)),
            /**
             * Получить расписание аудитории
             * @param {string}   room     ID аудитории
             * @param {function} callback
             */
            schedule: (room, callback) => query(`schedule/room/${room}`, null, 'get', callback, null),
        },
        // Секция курсов
        grade: {
            /**
             * Получить список курсов
             * @param {function} callback
             */
            list: callback => query('grade/list', null, 'get', grades => {
                let degrees = {
                    'bachelor': 'Бакалавриат',
                    'master': 'Магистратура',
                    'postgraduate': 'Асписрантура',
                };

                callback(grades.map(grade => ({
                    id: grade.id,
                    num: String(grade.num),
                    degree: grade.degree,
                    name: `${degrees[grade.degree]}, ${grade.num} курс`
                })));
            }, null),
            /**
             * Добавить курс
             * @param {string}   num      Номер
             * @param {string}   degree   Степень обучния
             * @param {function} callback
             */
            add: (num, degree, callback) => query('grade', { num, degree }, 'put', result => callback(result.res), () => callback(null)),
            /**
             * Изменить курс
             * @param {string}   grade    ID курса
             * @param {string}   num      Номер
             * @param {string}   degree   Степень обучния
             * @param {function} callback
             */
            update: (grade, num, degree, callback) => query(`grade/${grade}`, { num, degree }, 'post', () => callback(true), () => callback(false)),
            /**
             * Удалить курс
             * @param {string}   grade    ID курса
             * @param {function} callback
             */
            delete: (grade, callback) => query(`grade/${grade}`, null, 'delete', () => callback(true), () => callback(false)),
            /**
             * Получить расписание курса
             * @param {string}   grade    ID курса
             * @param {function} callback
             */
            schedule: (grade, callback) => query(`schedule/grade/${grade}`, null, 'get', callback, null),
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
        group: {
            /**
             * Получить список групп
             * @param {function} callback
             */
            list: callback => {
                api.grade.list(grades => {
                    let groups = [];
                    let queryCount = 0;
                    grades.forEach(({ id }) => {
                        api.group.listGrade(id, gradeGroups => {
                            groups.push.apply(groups, gradeGroups);
                            queryCount++;
                            if (queryCount === grades.length) callback(groups);
                        });
                    });
                });
            },
            /**
             * Получить список групп для курса
             * @param {string}   grade    ID курса
             * @param {function} callback
             */
            listGrade: (grade, callback) => query(`group/forGrade/${grade}`, null, 'get', callback, null),
            /**
             * Добавить группу
             * @param {string}   num      Номер
             * @param {string}   name     Название
             * @param {string}   grade    ID курса
             * @param {function} callback
             */
            add: (num, name, grade, callback) => query('group', { num, name, grade }, 'put', result => callback(result.res), () => callback(null)),
            /**
             * Изменить группу
             * @param {string}   group    ID группы
             * @param {string}   num      Номер
             * @param {string}   name     Название
             * @param {function} callback
             */
            update: (group, num, name, grade, callback) => query(`group/${group}`, { num, name, grade }, 'post', () => callback(true), () => callback(false)),
            /**
             * Удалить группу
             * @param {string}   group    ID группы
             * @param {function} callback
             */
            delete: (group, callback) => query(`group/${group}`, nul, 'delete', () => callback(true), () => callback(false)),
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
            add: (name, abbr, callback) => query('subject', { name, abbr }, 'put', result => callback(result.res), () => callback(null)),
            /**
             * Изменить предмет
             * @param {string}   subject  ID предмета
             * @param {string}   name     Название
             * @param {string}   abbr     Сокращение
             * @param {function} callback
             */
            update: (subject, name, abbr, callback) => query(`subject/${subject}`, { name, abbr }, 'post', () => callback(true), () => callback(false)),
            /**
             * Удалить предмет
             * @param {string}   subject  ID предмета
             * @param {function} callback
             */
            delete: (subject, callback) => query(`subject/${subject}`, null, 'delete', () => callback(true), () => callback(false)),
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
                query('auth/status', null, 'get', ({ status }) => callback(status === 'manager'), null);
            },
            /**
             * Авторизоваться
             * @param {string}   login    Логин
             * @param {string}   pass     Пароль
             * @param {function} callback
             */
            login: (login, pass, callback) => {
                query('auth/login', { login, pass }, 'get', ({ APIKey }) => {
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
        url = `${ulrPrefix}${url}?APIKey=${localStorage.APIKey}`;
        data = data || {};
        type = (type || 'POST').toUpperCase();
        callback = callback || (() => {});
        errback = errback || (() => {});

        let dataType = 'json';
        let success = result => callback(result);
        let error = () => errback();

        $.ajax({ url, data, type, dataType, success, error });
    };
})();
