// Версия 1.2.1
$(function () {
    var $group = $("#group");
    var $grade = $("#course");
    var $teacher = $("#teacher");
    var $day = $("#day");
    var $room = $("#auditory");
    var $type = $('#type');

    var $table = $('.timetable_wrapper');


    var tableGen = new Generator({ week: 0 }); // 0 - upper, 1 - lower
    var table = new Timetable(tableGen, { base: $table });

    loader.week(function (week) {
        'use strict';
        var actualWeek = week === 0 ? 'верхняя неделя' : 'нижняя неделя';
        $('.week_now').text('Сейчас ' + actualWeek);
        $.schedule.state.type = week;
        tableGen.setWeek(week);
    });

    $(window).resize(function () {
        table.optimize();
    });

    var showList = {
        all: [$grade, $group, $teacher, $room, $day],
        group: [$grade, $group],
        teacher: [$teacher],
        auditory: [$room]
    };




    $type.change(function () {
        table.show(false);
        var type = $type.val();
        if (!type) {
            invalidate(showList.all);
            return;
        }
        if (type === 'group') {
            loader.grades(function (data) {
                'use strict';
                $grade.html('<option value="0">Выберите курс:</option>'); // Сначала чистим select
                $.each(data, function (i, gradeInfo) {
                    $grade.append(menu.gradeOption(gradeInfo));
                });
            });
        } else if (type === 'teacher') {
            loader.teachers(function (data) {
                'use strict';
                $teacher.html('<option value="0">Выберите преподавателя:</option>');
                data.forEach(function (teacher) {
                    $teacher.append(menu.teacherOption(teacher));
                });
            });
        }
        typeVisualization(showList, type);
    });


    $grade.change(function () {
        table.show(false);
        var grade = $grade.val();
        if (!grade) {
            invalidate([$group]);
            return;
        }

        loader.groups($grade.val(), function(data) {
            'use strict';
            $group.html('<option value="0">Выберите группу:</option>'); // Сначала чистим select
            $.each(data, function (i, groupInfo) {
                $group.append(menu.groupOption(groupInfo));
            });
        });
        $group.removeAttr('disabled');
    });


    // Группа -> Курс -> Выбор группы [Вывод расписания]
    $group.change(function () {
        table.show(false);
        var group = $group.val();
        if (!group) {
            return;
        }

        // todo: extract to loader
        menu.getJSON('schedule/group/' + group, function (data) {
            prepareData(data);
            table.draw(data, {
                top: days,
                side: timeList
            });
            table.show(true);
            table.optimize();
        });
        $('.type_timetable').html($teacher.children('option:selected').text());
    });

    $teacher.change(function () {
        'use strict';
        table.show(false);
        var teacher = $teacher.val();
        if (!teacher) {
            return;
        }

        menu.getJSON('schedule/teacher/' + teacher, function (data) {
            prepareData(data);
            table.drawForTeacher(data, {
                top: days,
                side: timeList
            });
            table.show(true);
            table.optimize();
        });
    });


});
