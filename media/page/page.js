/* global api, SidePanel, system */
(() => {
    'use strict';

    class Page {
        setContentHeight() {
            system.$content.css('min-height', 0);

            let heightDiff = system.$body.get(0).clientHeight - system.$page.height();
            if (heightDiff > 0) system.$content.css('min-height', system.$content.outerHeight() + heightDiff);

            if (system.$intro.is(':visible')) system.$intro.css('margin-top', (system.$content.height() - system.$intro.height()) / 2);
        }

        setWeek() {
            switch (system.week) {
                case 'upper':
                    system.$week.html('Сейчас верхняя неделя');
                    break;

                case 'lower':
                    system.$week.html('Сейчас нижняя неделя');
                    break;
            }
        }
    }

    window.Page = Page;
})();
