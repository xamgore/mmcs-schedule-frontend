/* global api, Page, Switcher, System */
(function () {
    'use strict';

    var system = window.system = new System();
    var page = new Page();
    var switcher = new Switcher();

    // dev
    system.backendUrl = 'http://users.mmcs.sfedu.ru:3000/';

    $(function () {
        system.getElements();

        $(document).ajaxStart(function () {
            system.$body.css('cursor', 'progress');
        });

        $(document).ajaxStop(function () {
            system.$body.css('cursor', 'auto');
        });

        api.week.get(function (week) {
            system.setWeek(week);
            page.setWeek();
        });

        api.times.get(function (times) {
            system.setTimes(times);
        });

        switcher.set();

        system.$print.on('click', function () {
            window.print();
        });

        system.$auth.on('click', page.auth);

        page.setContentHeight();
        $(window).on('load', page.setContentHeight);
        $(window).resize(page.setContentHeight);
        system.onShow = page.setContentHeight;
    });
})();
