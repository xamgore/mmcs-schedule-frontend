(function () {
    'use strict';

    var System = window.System = function () {
        this.backendUrl = window.document.location.protocol + '//' + window.document.location.hostname + ':3000/';
    };

    System.prototype.getElements = function () {
        this.$body = $('body');
        this.$page = $('#page');
        this.$week = $('#week');
        this.$switch = $('#switch');
        this.$print = $('#print');
        this.$auth = $('#auth');
        this.$content = $('#content');
        this.$intro = $('#intro');
        this.$schedule = $('#schedule');
    };

    System.prototype.setWeek = function (week) {
        this.week = week;
    };

    System.prototype.setTimes = function (times) {
        this.times = times;
    };

    System.prototype.getUrl = function (url) {
        return this.backendUrl + url;
    };

    System.prototype.showSchedule = function () {
        this.$intro.hide();
        this.$schedule.show();
    };

    System.prototype.showIntro = function () {
        this.$schedule.hide();
        this.$intro.show();
    };
})();
