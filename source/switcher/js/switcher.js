function setSwitcher() {

  const addDefaultItem = (text, data) =>
    [{ text, id: 'default', disabled: true }].concat(data)

  const extractIdAndName = (list, defaultName = '') =>
    list.map(el => ({ id: el.id, text: el.name || defaultName }))

  // TODO: rewrite on vue
  const showIntro = () => {
    $intro.show()
    $schedule.hide()
    $(window).trigger('onScheduleShow', [ false ])
  }

  // showIntro()


  const scheduleTypes = addDefaultItem('Тип расписания', [
    { id: 'grade', text: 'Курс' },
    { id: 'group', text: 'Группа' },
    { id: 'teacher', text: 'Преподаватель' },
    { id: 'room', text: 'Аудитория' },
    { id: 'chair', text: 'Кафедра', disabled: true },
    { id: 'session', text: 'Сессия', disabled: true },
  ])

  const openSchedule = (type, data) => {
    $($schedule).html('')

    switch (type) {
      case 'grade':
        let weekdays = [ 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ' ]

        // takes the second character of (0,11:55:00,13:30:00,full)
        const dayOf = lesson => +lesson.timeslot[1]

        const buildScheduleForDay = (weekday, dayIndex) => {
          let lessons = data.lessons.filter(les => dayOf(les) === dayIndex)
          let info = Object.assign({}, data, { lessons, weekday })

          new Schedule('day', info)
            .draw($('<div class="schedule"></div>').appendTo($schedule))
        }

        weekdays.forEach(buildScheduleForDay)
        break


      case 'group':
      case 'teacher':
      case 'day':
      case 'room':
        new Schedule(type, data)
          .draw($('<div class="schedule"></div>').appendTo($schedule))
        break
    }

    // show schedule
    $intro.hide()
    $schedule.show()
    $(window).trigger('onScheduleShow', [ true ])
  }

  new Vue({
    el: '#switch',
    data: {
      type: null,
      types: scheduleTypes,
      grade: null,
      grades: null,
      day: null,
      days: null,
      group: null,
      groups: null,
      teacher: null,
      teachers: null,
      room: null,
      rooms: null
    },

    created() {
      this.type = 'default'
    },

    watch: {
      type: function (type) {
        if (!type) return
        // type is in ['grade', 'group', 'teacher', 'room']

        this.grade = this.day = this.group = this.teacher = this.room = null

        if (type === 'default') return showIntro()

        if (type === 'group') type = 'grade'

        const def = ({
          grade:   { item: 'Курс' },
          teacher: { item: 'Преподаватель', name: 'Без имени' },
          room:    { item: 'Аудитория', name: 'Без названия' }
        })[type]

        api[type].list(items => {
          this[type] = 'default'
          this[type + 's'] = addDefaultItem(def.item, extractIdAndName(items, def.name || ''))
        })
      },

      grade: function () {
        if (!this.grade) return

        this.day = this.group = null

        if (this.grade === 'default')
          return showIntro()

        switch (this.type) {
          case 'grade':
            const names = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
            const items = names.map((n, i) => ({ id: i.toString(), text: n }))

            this.days = addDefaultItem('Неделя', items)
            this.day = 'default'
            break

          case 'group':
            const extractName = gr => {
              let name = gr.name && gr.name !== 'NULL' ? gr.name + ', ' : ''
              return `${name} ${gr.num} группа`
            }

            api.group.listGrade(this.grade, groups => {
              let items = groups.map(gr => ({ id: gr.id, text: extractName(gr) }))
              this.groups = addDefaultItem('Группа', items)
            })

            this.group = 'default'
            break
        }
      },

      day: function() {
        if (!this.day) return

        if (this.day === 'default') {
          api.grade.schedule(this.grade, result => openSchedule('grade', result))
        } else {
          api.grade.scheduleForDay(this.grade, this.day, result => openSchedule('day', result))
        }
      },

      group: function() {
        if (!this.group) return
        if (this.group === 'default') return showIntro()

        api.group.schedule(this.group, result => openSchedule('group', result))
      },

      teacher: function () {
        if (!this.teacher) return
        if (this.teacher === 'default') return showIntro()

        api.teacher.schedule(this.teacher, result => openSchedule('teacher', result))
      },

      room: function () {
        if (!this.room) return
        if (this.room === 'default') return showIntro()

        api.room.schedule(this.room, result => openSchedule('room', result))
      },
    },
  })

}
