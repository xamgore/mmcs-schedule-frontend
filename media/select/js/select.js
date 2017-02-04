(() => {
    'use strict';

    class Select {
        /**
         * Сгенерировать список опций
         * @param  {select}   text Текст опции по-умолчанию
         * @param  {object[]} data Массив опций
         * @return {Select}        this
         */
        static getOptions(text, data) {
            return [ {
                id: 'default',
                text: text,
                disabled: true,
            } ].concat(data);
        }
    }

    Vue.component('fieldSelect', {
        template: '<select><slot></slot></select>',
        props: [ 'value', 'options', 'search' ],
        mounted: function () {
            let vm = this;
            $(this.$el)
                .select2({
                    minimumResultsForSearch: this.search ? 0 : -1,
                    data: this.options,
                })
                .val(this.value).change()
                .on('change', function () {
                    vm.$emit('input', this.value);
                });
        },
        watch: {
            value: function (value) {
                $(this.$el).val(value).change();
            },
            options: function (options) {
                $(this.$el).select2({
                    data: options,
                });
            },
        },
        destroyed: function () {
            $(this.$el).off().select2('destroy');
        },
    });

    window.Select = Select;
})();