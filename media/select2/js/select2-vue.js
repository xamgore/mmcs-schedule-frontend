(() => {
    'use strict';

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
})();