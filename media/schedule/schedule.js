// Версия 1.2.1
$(function () {
    'use strict';

    var mainTitle = 'Интерактивное расписание мехмата ЮФУ';
    var $group = $("#group");
    var $grade = $("#course");
    var $teacher = $("#teacher");
    var $day = $("#day");
    var $room = $("#auditory");
    var $type = $('#type');

    var $table = $('.timetable_wrapper');


    var setTitle = function (name) {
        var outName = mainTitle;
        if (name) {
            outName += ': ' + name;
        }
        document.title = outName;
    };
    setTitle('');

    var table = new Timetable({
        base: $table
    });
    table.set({
        days: days,
        times: timeList
    });

    loader.week(function (week) {
        var actualWeek = week === 0 ? 'верхняя неделя' : 'нижняя неделя';
        $('.week_now').text('Сейчас ' + actualWeek);
        $.schedule.state.type = week;
        table.set({week: week});
    });

    var showList = {
        all: [$grade, $group, $teacher, $room, $day],
        group: [$grade, $group],
        teacher: [$teacher],
        auditory: [$room]
    };




    $type.change(function () {
        $('.timetable_wrapper').hide()
        setTitle('');
        var type = $type.val();
        if (!type) {
            invalidate(showList.all);
            return;
        }
        if (type === 'group') {
            loader.grades(function (data) {
                $grade.html('<option value="0">Выберите курс:</option>'); // Сначала чистим select
                $.each(data, function (i, gradeInfo) {
                    $grade.append(menu.gradeOption(gradeInfo));
                });
            });
        } else if (type === 'teacher') {
            loader.teachers(function (data) {
                $teacher.html('<option value="0">Выберите преподавателя:</option>');
                data.forEach(function (teacher) {
                    $teacher.append(menu.teacherOption(teacher));
                });
            });
        }
        typeVisualization(showList, type);
    });


    $grade.change(function () {
        $('.timetable_wrapper').hide();
        setTitle('');
        var grade = $grade.val();
        if (!grade) {
            invalidate([$group]);
            return;
        }

        loader.groups($grade.val(), function(data) {
            $group.html('<option value="0">Выберите группу:</option>'); // Сначала чистим select
            $.each(data, function (i, groupInfo) {
                $group.append(menu.groupOption(groupInfo));
            });
        });
        $group.removeAttr('disabled');
    });


    // Группа -> Курс -> Выбор группы [Вывод расписания]
    $group.change(function () {
        $('.timetable_wrapper').hide();
        var group = $group.val();
        setTitle('');
        if (!group) {
            return;
        }

        // todo: extract to loader
        menu.getJSON('schedule/group/' + group, function (data) {
            $('.timetable_wrapper').hide();

            table.set({
                type: 'group',
                lessons: data.lessons,
                curricula: data.curricula
            });
            $('.welcome_wrapper').hide();
            $('.print_schedule').show();
            $('.timetable_wrapper').show();
            table.draw();
        });
        $('.type_timetable').html($teacher.children('option:selected').text());
    });

    $teacher.change(function () {
        $('.timetable_wrapper').hide();
        var teacher = $teacher.val();
        if (!teacher) {
            return;
        }

        menu.getJSON('schedule/teacher/' + teacher, function (data) {
            $('.timetable_wrapper').hide();
            setTitle($teacher.children('option:selected').text());

            table.set({
                type: 'teacher',
                lessons: data.lessons,
                curricula: data.curricula,
                groups: data.groups
            });
            $('.welcome_wrapper').hide();
            $('.print_schedule').show();
            $('.timetable_wrapper').show();
            table.draw();
        });
    });


});