/* global system */
(function () {
    'use strict';

    var Page = window.Page = function () {};

    Page.prototype.setContentHeight = function () {
        system.$content.css('min-height', 0);

        var heightDiff = system.$body.get(0).clientHeight - system.$page.height();
        if (heightDiff > 0) {
            system.$content.css('min-height', system.$content.outerHeight() + heightDiff);
        }

        if (system.$intro.is(':visible')) {
            system.$intro.css('margin-top', (system.$content.height() - system.$intro.height()) / 2);
        }
    };

    Page.prototype.setWeek = function () {
        switch (system.week) {
            case 'upper':
                system.$week.html('Сейчас верхняя неделя');
                break;
            case 'lower':
                system.$week.html('Сейчас нижняя неделя');
                break;
        }
    };
})();
