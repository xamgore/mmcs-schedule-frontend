(function () {
    'use strict';

    class System {
        constructor() {
            //this.backendUrl = `${window.document.location.protocol}//${window.document.location.hostname}:3000/`;
            this.backendUrl = '//users.mmcs.sfedu.ru:3000/';
            this.onShow = () => {};
        }

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
        }

        getUrl(url) {
            return this.backendUrl + url;
        }

        showSchedule() {
            this.$intro.hide();
            this.$schedule.show();
            this.onShow();
        }

        showIntro() {
            this.$schedule.hide();
            this.$intro.show();
            this.onShow();
        }
    }

    window.System = System;
})();
