$(() => {
  window.$intro = $('#intro')
  window.$schedule = $('#schedule')

  let system = window.system = new System()
  window.alerts = new Alerts()

  let bus = window.bus = new Vue({ data: { faculty: null, week: null } })

  api.week.get(week => {
    bus.week = system.week = week
    setWeekLabel(bus)
  })

  // Получение времен для расписания
  api.time.list(times => system.times = times)

  // Настройка селекторов
  setSwitcher(bus)

  // Настройка редактора
  new Editor().set()


  // Курсор во время API запросов
  $(document).ajaxStart(() => $(document.body).css('cursor', 'progress'))
  $(document).ajaxStop(() => $(document.body).css('cursor', 'auto'))

  // Обработка кнопки печати
  // TODO: move to vue
  $('#print').on('click', () => window.print())
})
