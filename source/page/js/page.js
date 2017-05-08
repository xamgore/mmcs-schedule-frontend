function setWeekLabel(bus) {
  new Vue({
    el: '#header',
    computed: {
      week: () => bus.week,
      fac: () => bus.faculty,
      faculty() {
        if (this.fac === 'mmcs')
          return 'мехмата'
        if (this.fac === 'management')
          return 'факультета управления'

        return ''
      },
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
