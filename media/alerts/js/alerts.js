(() => {
    'use strict';

    class Alerts {
        constructor() {
            this.alerts = new Vue({
                el: '#alerts',
                data: {
                    alerts: [],
                },
                methods: {
                    create: function (type, message) {
                        let alert = { type, message };
                        this.alerts.push(alert);
                        setTimeout(this.delete.bind(this, alert), 3000);
                    },
                    delete: function (alert) {
                        alert.deleted = true;
                        this.$forceUpdate();
                    }
                },
            });
        }

        success(message) {
            this.alerts.create('success', message);
        }

        info(message) {
            this.alerts.create('info', message);
        }

        warning(message) {
            this.alerts.create('warning', message);
        }

        danger(message) {
            this.alerts.create('danger', message);
        }
    }

    window.Alerts = Alerts;
})();