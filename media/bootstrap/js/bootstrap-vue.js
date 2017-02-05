(() => {
    'use strict';

    Vue.component('modal', {
        props: [ 'title', 'size' ],
        template:
            '<div class="modal fade">' +
                '<div class="modal-dialog">' +
                    '<div class="modal-content">' + 
                        '<div class="modal-header">' +
                            '<button type="button" class="close" data-dismiss="modal">&times;</button>' +
                            '<h4 class="modal-title">{{title}}</h4>' +
                        '</div>' +
                        '<div class="modal-body">' +
                            '<slot></slot>' +
                        '</div>' +
                        '<div class="modal-footer">' +
                            '<slot name="footer"></slot>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>',
        mounted: function () {
            if (this.size === 'small') $(this.$el).find('.modal-dialog').addClass('modal-sm');
            if (this.size === 'large') $(this.$el).find('.modal-dialog').addClass('modal-lg');

            $(this.$el)
                .on('show.bs.modal', event => this.$emit('show', event))
                .on('shown.bs.modal', event => this.$emit('shown', event))
                .on('hide.bs.modal', event => this.$emit('hide', event))
                .on('hidden.bs.modal', event => this.$emit('hidden', event));
        },
        destroyed: function () {
            $(this.$el).off();
        },
    });

    Vue.component('form-input', {
        props: [ 'id', 'name', 'value', 'type' ],
        template:
            '<div class="form-group">' +
                '<label :for="id" class="col-xs-3 control-label">{{name}}</label>' +
                '<div class="col-xs-9">' +
                    '<input :type="type" class="form-control" :id="id" :value="value" :placeholder="name" v-on:input="input">' +
                '</div>' +
            '</div>',
        methods: {
            input: function (event) {
                this.$emit('input', event.target.value);
            },
        },
    });
})();