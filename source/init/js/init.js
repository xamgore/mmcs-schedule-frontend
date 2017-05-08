$(() => {
  window.$intro = $('#intro')
  window.$schedule = $('#schedule')

  let system = window.system = new System()
  window.alerts = new Alerts()

  api.week.get(week => {
    system.week = week
    setWeekLabel()
  })

  // Получение времен для расписания
  api.time.list(times => system.times = times)

  // Настройка селекторов
  setSwitcher()

  // Настройка редактора
  new Editor().set()


  // Курсор во время API запросов
  $(document).ajaxStart(() => $(document.body).css('cursor', 'progress'))
  $(document).ajaxStop(() => $(document.body).css('cursor', 'auto'))

  // Обработка кнопки печати
  // TODO: move to vue
  $('#print').on('click', () => window.print())
})
