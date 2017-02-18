(() => {
    'use strict';

    Vue.component('datepicker', {
        props: [ 'value' ],
        template: '<div></div>',
        mounted: function () {
            $(this.$el)
                .datepicker({
                    weekStart: 1,
                    language: "ru",
                    todayHighlight: true,
                })
                .on('changeDate', event => this.$emit('input', event.date.toISOString()));
        },
    });
})();