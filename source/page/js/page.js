(() => {
    'use strict';

    class Page {
        /**
         * Установить неделю в шапке
         */
        setWeek() {
            let $week = $('#week');

            switch (system.week) {
                case 'upper':
                    $week.html('Сейчас верхняя неделя');
                    break;

                case 'lower':
                    $week.html('Сейчас нижняя неделя');
                    break;

                default:
                    $week.html('Неделя не известна');
            }
        }
    }

    window.Page = Page;
})();
