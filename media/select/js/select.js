(() => {
    'use strict';

    class Select {
        /**
         * @param  {string} id ID селектора
         */
        constructor(id, $block) {
            this.id = id;
            this.$select = $(`<select id="${id}"></select>`).appendTo($block);
            this.$select.selectpicker('render');
        }

        /**
         * Создать опцию для селекта
         * @param  {string} value    Значение опции
         * @param  {string} text     Текст опции
         * @param  {bool}   disabled Отключение опции
         * @return {string}          HTML опции
         */
        static createOption(value, text, disabled) {
            return $(`<option value="${value}">${text}</option>`).prop('disabled', disabled);
        }

        /**
         * Заполнение селекта
         * @param  {select}   text Текст опции по-умолчанию
         * @param  {object[]} data Массив опций
         * @return {Select}        this
         */
        fill(text, data) {
            this.$select.html('');

            Select.createOption('default', text).appendTo(this.$select);
            data.forEach(item => Select.createOption(item.value, item.text, item.disabled).appendTo(this.$select));
            this.$select.selectpicker('destroy').selectpicker('render');

            let value = localStorage[this.id];
            if (value != null) {
                this.initValue = value;
            } else {
                this.value = 'default';
            }

            return this;
        }

        /**
         * Привязать действие на селектор
         * @param  {string[]} values   Список опций для которых выполняется, по-умолчанию - для всех
         * @param  {function} callback
         * @return {Select}            this
         */
        bind(values, callback) {
            if (typeof values === 'function') {
                callback = values;
                values = null;
            }

            this.$select.change((event, param) => {
                if (values == null || values.includes(this.value)) callback(this.value, param);
            });

            return this;
        }

        /**
         * Отобразить селектор
         * @return {Select} this
         */
        show() {
            this.$select.selectpicker('show');
            return this;
        }

        /**
         * Скрыть селектор
         * @return {Select} this
         */
        hide() {
            this.$select.selectpicker('hide');
            return this;
        }

        /**
         * Получить значение
         * @return {string} Значение
         */
        get value() {
            return this.$select.val();
        }

        /**
         * Задать значение
         * @param {string} value Значение
         */
        set value(value) {
            this.$select.find(`[value="${value}"]`).prop('selected', true);
            this.$select.trigger('change');
            this.$select.selectpicker('render');
        }

        /**
         * Задать значение с флагом init
         * @param {string} value Значение
         */
        set initValue(value) {
            this.$select.find(`[value="${value}"]`).prop('selected', true);
            this.$select.trigger('change', [ true ]);
            this.$select.selectpicker('render');
        }
    }

    window.Select = Select;
})();