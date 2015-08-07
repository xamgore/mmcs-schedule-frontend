// Версия 1.2.1
$(function () {
    var host = window.document.location.protocol + '//' + window.document.location.hostname;

    var $group = $("#group");
    var $grade = $("#course");
    var $teacher =  $("#teacher");
    var $day = $("#day");
    var $room = $("#auditory");
    var $type = $('#type');
    var $selectList = [$grade, $group, $teacher, $room, $day];

    createTimeTable();
    $('.week_now').text('Сейчас верхняя неделя'); // ToDo: Получение данных у backend'а


    // j - строка таблицы
    // i - столбец таблицы





    var invalidateType = function() {
        $selectList.forEach(function(ind, elem) {
            elem.attr("disabled", "disabled").val('0');
        });
    };

    var processTypeGroup = function() {
        $grade.removeAttr("disabled");
        $.getJSON(host + ':3000/grade/list', function (data) {
            $grade.html('<option value="0">Выберите курс:</option>'); // Сначала чистим select
            $.each(data, function (i, grade) {
                $grade.append('<option value="' + grade.id + '">' + grade.degree + grade.num + '</option>');
            });
        });
        $group.val('0');
        $group.attr("disabled", "disabled"); // Убирает баг
        $grade.show();
        $group.show();
        $teacher.hide();
        $room.hide();
        $day.hide();
    };

    var processTypeTeacher = function() {
        $teacher.removeAttr("disabled");
        $.getJSON(host + ':3000/teacher/list', function (data) {
            $teacher.html('<option value="0">Выберите преподавателя:</option>'); // Сначала чистим select
            $.each(data, function (i, teacher) {
                $teacher.append('<option value="' + teacher.id + '">' + teacher.name + '</option>');
            });
        });
        $grade.hide();
        $group.hide();
        $teacher.show();
        $room.hide();
        $day.hide();
    };

    var processTypeRoom = function() {
        $room.removeAttr("disabled");
        $.getJSON(host + ':3000/classrooms/list', function (data) {
            $room.html('<option value="0">Выберите аудиторию:</option>'); // Сначала чистим select
            $.each(data, function (i, room) {
                $room.append('<option value="' + room.id + '">' + room.title + '</option>');
            });
        });
        $grade.hide();
        $group.hide();
        $teacher.hide();
        $room.show();
        $day.hide();
    };

    var processTypeGrade = function() {
        $grade.removeAttr("disabled");
        console.log(host);
        $.getJSON(host + ':3000/grade/list', function (data) {
            $grade.html('<option value="0">Выберите курс:</option>'); // Сначала чистим select
            $.each(data, function (i, grade) {
                $grade.append('<option value="' + grade.id + '">' + grade.title + '</option>');
            });
        });
        $group.val('0');
        $group.attr("disabled", "disabled"); // Убирает баг
        $grade.show();
        $group.hide();
        $teacher.hide();
        $room.hide();
        $day.show();
    };


    // Выбор типа расписания
    $type.change(function () {
        var type = $type.val();

        if ($('#timetable_wrapper').css('display') == 'block') {
            hideTimeTable();
        }
        if (!type) {
            invalidateType();
            return;
        }

        switch (type) {
            case 'group':
                processTypeGroup();
                break;
            case 'teacher':
                processTypeTeacher();
                break;
            case 'auditory':
                processTypeRoom();
                break;
            case 'course':
                processTypeGrade();
                break;
        }
    });

    // Группа -> Выбор курса
    $grade.change(function () {
        if ($('#timetable_wrapper').css('display') == 'block') {
            hideTimeTable();
        }

        if (!$grade.val() || $type.val() !== 'group') {
            $group.attr("disabled", "disabled");
            $group.val('0');
            return;
        }

        $.getJSON(host + ':3000/group/list/' + $grade.val(), {} , function (data) {
            $group.removeAttr("disabled");
            $group.html('<option value="0">Выберите группу:</option>'); // Сначала чистим select
            $.each(data, function (i) {
                $group.append('<option value="' + data[i].id + '">' + data[i].name + '</option>');
            });
        });
    });

    // Группа -> Курс -> Выбор группы [Вывод расписания]
    $group.change(function () {
        var group = $group.val();
        if (!group) {
            hideTimeTable();
            return;
        }

        // todo: kill getdata.php
        $.getJSON('getdata.php', {
            'data': 'schedule',
            'type': 'Group',
            'course': $grade.val(),
            'group': group
        }, function (json_schedule) {
            removeCells(); // Удаляем ячейки
            createTimeTable();
            outputSchedule(json_schedule.schedule, json_schedule.current_week);
        });
        $('.type_timetable').html(
            $grade.children('option:selected').text() + ', ' + $group.children('option:selected').text()
        );

    });


    // Преподаватель -> Выбор преподавателя [Вывод расписания]
    $teacher.change(function () {
        var teacher = $teacher.val();
        if (!teacher) {
            hideTimeTable();
            return;
        }

        $.getJSON('http://schedule.local:3000/schedule/byTeacher/' + teacher, function (json_schedule) {
            removeCells(); // Удаляем ячейки
            createTimeTable(json_schedule.schedule);
            outputSchedule(json_schedule.schedule, json_schedule.current_week);
        });
        $('.type_timetable').html($teacher.children('option:selected').text());
    });

    // Аудитория -> Выбор аудитории [Вывод расписания]
    $room.change(function () {
        var room = $room.val();
        if (!room) {
            hideTimeTable();
            return;
        }

        // todo: kill getdata.php
        $.getJSON('getdata.php', {
            'data': 'schedule',
            'type': 'Classroom',
            'id': room
        }, function (json_schedule) {
            removeCells(); // Удаляем ячейки
            createTimeTable();
            outputSchedule(json_schedule.schedule, json_schedule.current_week);
        });
        $('.type_timetable').html('Аудитория ' + $room.children('option:selected').text());
    });


    // Курс -> Выбор курса
    $grade.change(function () {

        if ($('#timetable_wrapper').css('display') == 'block') {
            hideTimeTable();
        }

        if ($grade.val() && $type.val() === 'course') {
            $day.removeAttr("disabled");
        } else {
            $day.attr("disabled", "disabled");
        }
        $day.val('0');
    });


    // Курс -> Выбор курса -> Выбор дня [Вывод расписания]
    $day.change(function () {
        var day = $day.val();
        if (!$day.val()) {
            hideTimeTable();
            return;
        }

        // todo: kill getdata.php
        $.getJSON('getdata.php', {
            'data': 'schedule',
            'type': 'Course',
            'course': $grade.val(),
            'day': day
        }, function (data) {
            removeCells(); // Удаляем ячейки
            createTimeTableCourse2(data.schedule);
            outputSchedule(data.schedule, data.current_week);
        });
        $('.type_timetable').html('Курс ' + $grade.children('option:selected').text());
    });

    $(window).resize(function () {
        optimizationTimeTable();
    });



});
