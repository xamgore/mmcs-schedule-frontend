(() => {
    'use strict';

    class Editor {
        /**
         * Получение статуса и настройка панели
         * @return {Editor} this
         */
        set() {
            system.$authForm.on('submit', event => this.login(event));
            system.$logout.on('click', event => this.logout(event));
            system.$authModal.on('shown.bs.modal', () => system.$authForm.find('[name=login]').focus());

            api.auth.status(ok => ok ? this.enable() : this.disable());

            return this;
        }

        /**
         * Обаботка формы авторизации
         * @return {Editor} this
         */
        login(event) {
            event.preventDefault();

            let login = system.$authForm.find('[name=login]').val();
            let pass = system.$authForm.find('[name=pass]').val();

            api.auth.login(login, pass, success => {
                if (success) {
                    this.enable();
                    system.$authModal.modal('hide');
                } else {
                    system.$authForm.addClass('has-error');
                    setTimeout(() => system.$authForm.removeClass('has-error'), 3000);
                }
            });

            return this;
        }

        /**
         * Обработка кнопки выхода
         * @return {Editor} this
         */
        logout() {
            api.auth.logout(() => this.disable());

            return this;
        }

        /**
         * Включить редактор
         * @return {Editor} this
         */
        enable() {
            system.$editMenu.show();
            system.$login.hide();
            system.$logout.show();

            return this;
        }

        /**
         * Выключить редактор
         * @return {Editor} this
         */
        disable() {
            system.$editMenu.hide();
            system.$login.show();
            system.$logout.hide();

            return this;
        }
    }

    window.Editor = Editor;
})();