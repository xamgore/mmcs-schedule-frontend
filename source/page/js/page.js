function setWeekLabel() {
  new Vue({
    el: '#week',
    data: { week: system.week },
    template: '<span class="week">{{ label }}</span>',

    computed: {
      label() {
        if (this.week === 0)
          return 'Сейчас верхняя неделя'
        if (this.week === 1)
          return 'Сейчас нижняя неделя'

        return 'Неделя не известна'
      }
    }

  })
}
