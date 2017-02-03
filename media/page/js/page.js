(() => {
    'use strict';

    class Page {
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
