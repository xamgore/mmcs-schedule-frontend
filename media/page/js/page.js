(() => {
    'use strict';

    class Page {
        /**
         * Подстроить высоту страницы и положение интро
         */
        setContentHeight() {
            system.$content.css('min-height', 0);

            let heightDiff = system.$body.get(0).clientHeight - system.$page.height();
            if (heightDiff > 0) system.$content.css('min-height', system.$content.outerHeight() + heightDiff);

            if (system.$intro.is(':visible')) system.$intro.css('margin-top', (system.$content.height() - system.$intro.height()) / 2);
        }

        /**
         * Установить неделю в шапке
         */
        setWeek() {
            switch (system.week) {
                case 'upper':
                    system.$week.html('Сейчас верхняя неделя');
                    break;

                case 'lower':
                    system.$week.html('Сейчас нижняя неделя');
                    break;

                default:
                    system.$week.html('Неделя не известна');
            }
        }
    }

    window.Page = Page;
})();
