(() => {
    'use strict';

    class Editor {
        /**
         * Получение статуса и настройка панели
         */
        set() {
            system.$authForm.on('submit', this.login);
            system.$logout.on('click', this.logout);

            api.auth.status(ok => {
                if (ok) {
                    system.$login.hide();
                    system.$editmenu.show();
                    system.$logout.show();
                }
            });
        }

        /**
         * Обаботка формы авторизации
         */
        login(event) {
            event.preventDefault();

            let login = system.$authForm.find('[name=login]').val();
            let pass = system.$authForm.find('[name=pass]').val();

            api.auth.login(login, pass, success => {
                if (success) {
                    location.reload();
                } else {
                    system.$authForm.addClass('has-error');
                    setTimeout(() => system.$authForm.removeClass('has-error'), 3000);
                }
            });
        }

        /**
         * Обработка кнопки выхода
         */
        logout() {
            api.auth.logout(() => location.reload());
        }
    }

    window.Editor = Editor;
})();