(() => {
    'use strict';

    class System {
        constructor() {
            this.intro = '#intro';
            this.schedule = '#schedule';

            this.showIntro();
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
