/* global api, Page, Switcher, System */
(function () {
    'use strict';

    var system = window.system = new System();
    var page = new Page();
    var switcher = new Switcher();

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
    });

    $(document).ready(page.setContentHeight);
    $(window).load(page.setContentHeight);
    $(window).resize(page.setContentHeight);
})();
