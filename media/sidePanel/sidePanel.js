/* global system */
(function () {
    'use strict';

    /**
     * Конструктор класса SidePanel
     * @param {jQuery} $data объект jQuery с данными
     * @param {int}    width ширина панели
     */
    var SidePanel = window.SidePanel = function ($data, width) {
        this.$data = $data;
        this.width = width;

        this.buildPanel();
    };

    SidePanel.prototype.buildPanel = function () {
        this.$block = $('<div class="side-panel"></div>').appendTo(system.$body);
        this.$block.css('right', '-' + this.width * 2 + 'px');
        this.$block.width(this.width);
        this.$data.appendTo(this.$block);
    };

    SidePanel.prototype.show = function () {
        system.$overlay.fadeIn(300);
        this.$block.animate({
            right: 0
        }, 300);
        var that = this;
        system.$overlay.on('click', function () {
            that.hide();
        });
    };

    SidePanel.prototype.hide = function () {
        system.$overlay.off('click');
        this.$block.animate({
            right: -this.width * 2
        }, 300, function () {
            system.$overlay.fadeOut(300);
        });
    };

    SidePanel.prototype.destruct = function () {
        this.$block.remove();
    };
})();
