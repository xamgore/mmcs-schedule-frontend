var modalWindow = (function () {
    'use strict';

    var modalWindow = {
        open: function (settings, data) {
            windows.push({});

            // Создание блока окна
            windows[windows.length - 1].$block = $('<div class="modal-window">' +
                '<div class="modal-window__wrap">' +
                    '<div class="modal-window__inner">' +
                        '<div class="modal-window__close" id="window-close"></div>' +
                        '<div class="modal-window__actions-list"></div>' +
                        '<div class="modal-window__title"></div>' +
                        '<div class="modal-window__tab-list"></div>' +
                        '<div class="modal-window__content-list"></div>' +
                    '</div>' +
                '</div>' +
            '</div>');

            // Разбор входных данных
            parseWindowObject(settings);

            // Добавление окна
            $('body').append(windows[windows.length - 1].$block);

            // Скрытие предыдущего окна
            if (windows.length > 1) {
                windows[windows.length - 2].$block.hide();
            }

            // Закрытие по фону и кнопке
            addCloseEvents();

            // Переключатель вкладок
            addTabSwitcher();

            // Подтвержедение закрытия
            // #TODO: переместить
            var current = windows[windows.length - 1];
            current.notChanged = true;
            $(current.$block).find('input, select, textarea').not('.change-ignore').change(function () {
                current.notChanged = false;
            });

            return windows[windows.length - 1].$block;
        },
        close: function (softClose) {
            if (
                !softClose || windows[windows.length - 1].notChanged ||
                confirm('Вы действительно хотите закрыть окно? Все несохраненные данные будут утеряны')
            ) {
                // Удаление блока со страницы
                windows[windows.length - 1].$block
                    .unbind('click')
                    .remove();

                // Показ предыдущего окна
                if (windows.length > 1) {
                    windows[windows.length - 2].$block.show();
                }

                // Удаление окна из стека
                windows.pop();

                return true;
            }
            return false;
        }
    };

    // Стек окон
    var windows = [];

    // Обработать окно, пришедшее как объект
    function parseWindowObject(settings) {
        settings = $.extend({
            width: 800,
            title: '',
            actions: '',
            content: ''
        }, settings);

        var $block = windows[windows.length - 1].$block;
        var $title = $block.find('.modal-window__title');
        var $actionsList = $block.find('.modal-window__actions-list');
        var $tabList = $block.find('.modal-window__tab-list');
        var $contentList = $block.find('.modal-window__content-list');

        // Ширина
        $block.children().width(settings.width);

        // Заголовок
        $title.text(settings.title);

        // Действия
        $('<div class="modal-window__actions">' + settings.actions + '</div>').appendTo($actionsList);

        // Определение наличия влкадок
        if (typeof settings.content === 'object') {
            // Перебор вкладок
            $.each(settings.content, function (_key, value) {
                value = $.extend({
                    title: '',
                    actions: '',
                    content: ''
                }, value);

                $('<div class="modal-window__actions">' + value.actions + '</div>').appendTo($actionsList);
                $('<div class="modal-window__tab">' + value.title + '</div>').appendTo($tabList);
                $('<div class="modal-window__content">' + value.content + '</div>').appendTo($contentList);
            });
        } else {
            $('<div class="modal-window__content">' + settings.content + '</div>').appendTo($contentList);
        }
    }

    // Установка событий для закрытия окна
    function addCloseEvents() {
        var $block = windows[windows.length - 1].$block;

        $block.click(function (event) {
            if ($(event.target).is('#window-close') ||
                $(event.target).is($block) || $(event.target).is($block.children())
            ) {
                modalWindow.close(true);
            }
        });
    }

    // Закрытие окна по ESC
    $(window).keyup(function (event) {
        if (event.which === 27 && windows.length !== 0) {
            event.preventDefault();
            modalWindow.close(true);
        }
    });

    // Добавление переключателя вкладок
    function addTabSwitcher() {
        var $block = windows[windows.length - 1].$block;

        var $tabList = $block.find('.modal-window__tab');
        var $actionsList = $block.find('.modal-window__actions:not(:first)');
        var $contentList = $block.find('.modal-window__content');
        $tabList.each(function (index) {
            var $currentTab = $(this);
            var $currentActions = $actionsList.eq(index);
            var $currentContent = $contentList.eq(index);
            $block.click(function (event) {
                if ($(event.target).is($currentTab)) {
                    $tabList.removeClass('modal-window__tab_selected');
                    $currentTab.addClass('modal-window__tab_selected');

                    $actionsList.hide();
                    $currentActions.show();

                    $contentList.hide();
                    $currentContent.show();
                }
            });
        });
        $tabList.first().click();
    }

    return modalWindow;
})();
