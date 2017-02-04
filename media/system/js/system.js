(() => {
    'use strict';

    class System {
        constructor() {
            this.body       = 'body';
            this.week       = '#week';
            this.switch     = '#switch';
            this.edit       = '#edit';
            this.print      = '#print';
            this.login      = '#login';
            this.logout     = '#logout';
            this.authForm   = '#authForm';
            this.authModal  = '#authModal';
            this.intro      = '#intro';
            this.schedule   = '#schedule';
        }

        /**
         * Отобразить расписание
         * @return {System} this
         */
        showSchedule() {
            $(this.intro).hide();
            $(this.schedule).show();
            $(window).trigger('onScheduleShow', [ true ]);

            return this;
        }

        /**
         * Отобразить интро
         * @return {System} this
         */
        showIntro() {
            $(this.intro).show();
            $(this.schedule).hide();
            $(window).trigger('onScheduleShow', [ false ]);

            return this;
        }
    }

    window.System = System;
})();
