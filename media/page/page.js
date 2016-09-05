/* global api, SidePanel, system */
(function () {
    'use strict';

    var Page = window.Page = function () {};

    Page.prototype.setContentHeight = function () {
        system.$content.css('min-height', 0);

        var heightDiff = system.$body.get(0).clientHeight - system.$page.height();
        if (heightDiff > 0) {
            system.$content.css('min-height', system.$content.outerHeight() + heightDiff);
        }

        if (system.$intro.is(':visible')) {
            system.$intro.css('margin-top', (system.$content.height() - system.$intro.height()) / 2);
        }
    };

    Page.prototype.setWeek = function () {
        switch (system.week) {
            case 'upper':
                system.$week.html('Сейчас верхняя неделя');
                break;
            case 'lower':
                system.$week.html('Сейчас нижняя неделя');
                break;
        }
    };

    Page.prototype.auth = function () {
        var content = '<form action="#" method="post" class="form-auth" id="form-auth">' +
            '<span class="title">Авторизация</span>' +
            '<input type="text" name="login" placeholder="Логин">' +
            '<input type="password" name="pass" placeholder="Пароль">' +
            '<button type="submit">Войти</button>' +
        '</form>';
        var sidePanel = new SidePanel(content, 500);
        sidePanel.onHide = sidePanel.destruct.bind(sidePanel);
        sidePanel.$block.find('#form-auth').on('submit', function (event) {
            event.preventDefault();

            var $form = $(this);

            var login = $form.find('[name=login]').val();
            var pass = $form.find('[name=pass]').val();

            api.auth.login(login, pass, function (result) {
                console.log(result);
            });

            sidePanel.hide();
        });
        sidePanel.show();
    };
})();
