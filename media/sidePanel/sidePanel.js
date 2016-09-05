/* global system */
(function () {
    'use strict';

    /**
     * Конструктор класса SidePanel
     * @param {string}   content сожержимое панели
     * @param {int}      width   ширина панели
     * @param {function} onHide  обработчик события закрытия панели
     */
    var SidePanel = window.SidePanel = function (content, width, onHide) {
        this.content = content;
        this.width = width;
        this.onHide = onHide || function () {};

        this.buildPanel();
    };

    SidePanel.prototype.buildPanel = function () {
        this.$block = $('<div class="side-panel"></div>').appendTo(system.$body);
        this.$block.css('right', '-' + this.width * 2 + 'px');
        this.$block.width(this.width);
        this.$block.append(this.content);

        return this;
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

        return this;
    };

    SidePanel.prototype.hide = function () {
        system.$overlay.off('click');
        var that = this;
        this.$block.animate({
            right: -this.width * 2
        }, 300, function () {
            system.$overlay.fadeOut(300, that.onHide.bind(that));
        });

        return this;
    };

    SidePanel.prototype.destruct = function () {
        this.$block.remove();
    };
})();
