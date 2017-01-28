/* global system */
(() => {
    'use strict';

    class Editor {
        constructor() {
            api.auth.status(ok => {
                if (ok) {
                    system.$login.hide();
                    system.$editmenu.show();
                    system.$logout.show();
                }
            });
        }

        login() {
            let $form = $('<form action="#" method="post" class="form-auth" id="form-auth">' +
                '<input type="text" name="login" placeholder="Логин">' +
                '<input type="password" name="pass" placeholder="Пароль">' +
                '<button type="submit">Войти</button>' +
            '</form>').appendTo(system.$body);

            system.$overlay.fadeIn();
            $form.fadeIn(() => {
                $form.on('submit', event => {
                    event.preventDefault();

                    let login = $form.find('[name=login]').val();
                    let pass = $form.find('[name=pass]').val();

                    api.auth.login(login, pass, success => {
                        if (success) {
                            location.reload();
                        } else {
                            $form.addClass('error');
                            $form.one('click', () => $form.removeClass('error'));
                        }
                    });
                });

                system.$overlay.click(() => {
                    system.$overlay.fadeOut();
                    $form.fadeOut(() => $form.remove());
                });
            });
        }

        logout() {
            api.auth.logout(() => location.reload());
        }
    }

    window.Editor = Editor;
})();