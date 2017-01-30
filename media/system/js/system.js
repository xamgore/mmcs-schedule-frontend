(() => {
    'use strict';

    class System {
        /**
         * Получение элементов на странице
         * @return {System} this
         */
        getElements() {
            this.$body      = $('body');
            this.$page      = $('#page');
            this.$week      = $('#week');
            this.$switch    = $('#switch');
            this.$print     = $('#print');
            this.$login     = $('#login');
            this.$logout    = $('#logout');
            this.$editmenu  = $('#editmenu');
            this.$content   = $('#content');
            this.$intro     = $('#intro');
            this.$schedule  = $('#schedule');
            this.$overlay   = $('#overlay');

            return this;
        }

        /**
         * Отобразить расписание
         * @return {System} this
         */
        showSchedule() {
            this.$intro.hide();
            this.$schedule.show();
            $(window).trigger('onScheduleShow', [ true ]);

            return this;
        }

        /**
         * Отобразить интро
         * @return {System} this
         */
        showIntro() {
            this.$schedule.hide();
            this.$intro.show();
            $(window).trigger('onScheduleShow', [ false ]);

            return this;
        }
    }

    window.System = System;
})();
