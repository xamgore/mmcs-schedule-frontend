(() => {
    'use strict';

    $(() => {
        let system = window.system = new System();
        let page = new Page();
        let switcher = new Switcher();
        let editor = new Editor();

        // Курсор во время API запросов
        $(document).ajaxStart(() => $(document.body).css('cursor', 'progress'));
        $(document).ajaxStop(() => $(document.body).css('cursor', 'auto'));

        // Получение недели и вывод ее в шапке
        api.week.get(week => {
            system.week = week;
            page.setWeek();
        });

        // Получение времен для расписания
        api.time.list(times => system.times = times);

        // Настройка селекторов
        switcher.set();
 
        // Настройка редактора
        editor.set();

        // Обработка кнопки печати
        $('#print').on('click', () => window.print());
    });
})();
