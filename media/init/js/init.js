/* global api, Page, Switcher, System */
(() => {
    'use strict';

    let system = window.system = new System();
    let page = new Page();
    let switcher = new Switcher();
    let editor = new Editor();

    $(() => {
        system.getElements();

        $(document).ajaxStart(() => system.$body.css('cursor', 'progress'));
        $(document).ajaxStop(() => system.$body.css('cursor', 'auto'));

        api.week.get(week => {
            system.week = week;
            page.setWeek();
        });

        api.times.get(times => system.times = times);

        switcher.set();
 
        editor.set();

        system.$print.on('click', () => window.print());

        page.setContentHeight();
        $(window).on('load', page.setContentHeight);
        $(window).resize(page.setContentHeight);
        system.onShow = page.setContentHeight;
    });
})();
