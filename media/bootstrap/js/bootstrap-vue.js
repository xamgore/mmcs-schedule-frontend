(() => {
    'use strict';

    Vue.component('modal', {
        props: [ 'id', 'title', 'size' ],
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
            if (this.id) this.$el.id = this.id;
            if (this.size === 'small') $(this.$el).find('.modal-dialog').addClass('modal-sm');
            if (this.size === 'large') $(this.$el).find('.modal-dialog').addClass('modal-lg');
        },
    });
})();