(() => {
    'use strict';

    class System {
        /**
         * Получение элементов на странице
         * @return {System} this
         */
        getElements() {
            this.$body      = $(this.body       = 'body');
            this.$page      = $(this.page       = '#page');
            this.$week      = $(this.week       = '#week');
            this.$switch    = $(this.switch     = '#switch');
            this.$edit      = $(this.edit       = '#edit');
            this.$print     = $(this.print      = '#print');
            this.$login     = $(this.login      = '#login');
            this.$logout    = $(this.logout     = '#logout');
            this.$authForm  = $(this.authForm   = '#authForm');
            this.$authModal = $(this.authModal  = '#authModal');
            this.$content   = $(this.content    = '#content');
            this.$intro     = $(this.intro      = '#intro');
            this.$schedule  = $(this.schedule   = '#schedule');

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
