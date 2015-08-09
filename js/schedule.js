// Версия 1.2.1
$(function () {
    var host = window.document.location.protocol + '//' + window.document.location.hostname;

    var $group = $("#group");
    var $grade = $("#course");
    var $teacher = $("#teacher");
    var $day = $("#day");
    var $room = $("#auditory");
    var $type = $('#type');
    var $selectList = [$grade, $group, $teacher, $room, $day];

    createTimeTable();
    $('.week_now').text('Сейчас верхняя неделя'); // ToDo: Получение данных у backend'а
    $(window).resize(function () {
        optimizationTimeTable();
    });


    // j - строка таблицы
    // i - столбец таблицы

    var showList = {
        group: [$grade, $group],
        teacher: [$teacher],
        auditory: [$room]
    };


    var typeVisualization = function(type) {
        $selectList.forEach(function (elem) {
            elem.hide();
        });
        if (type in showList) {
            var someVar = showList[type];
            someVar[0].removeAttr('disabled');

            var i;
            for (i = 1; i < someVar.length; ++i) {
                someVar[i].attr("disabled", true).val('0');
            }


            showList[type].forEach(function (elem) {
                elem.show();
            });
        }
    };

    var nameMap = {
        group: 'grade',
        course: 'grade',
        auditory: 'room',
        teacher: 'teacher'
    };

    var callbackMap = {
        group: function (data) {
            $grade.html('<option value="0">Выберите курс:</option>'); // Сначала чистим select
            $.each(data, function (i, grade) {
                $grade.append('<option value="' + grade.id + '">' + grade.degree + grade.num + '</option>');
            });
        },

        teacher: function (data) {
            $teacher.html('<option value="0">Выберите преподавателя:</option>'); // Сначала чистим select
            $.each(data, function (i, teacher) {
                $teacher.append('<option value="' + teacher.id + '">' + teacher.name + '</option>');
            });
        },

        auditory: function (data) {
            $room.html('<option value="0">Выберите аудиторию:</option>'); // Сначала чистим select
            $.each(data, function (i, room) {
                $room.append('<option value="' + room.id + '">' + room.title + '</option>');
            });
        }
    };

    var processProto = function(type, callback) {
        var url = host + ':3000/' + nameMap[type] + '/list';
        typeVisualization(type);
        $.getJSON(url, callbackMap[type]);
    };








    var invalidateType = function() {
        $selectList.forEach(function(elem) {
            elem.attr("disabled", "disabled").val('0');
        });
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
        processProto(type, callbackMap[type]);
    });

    // Группа -> Выбор курса
    // Курс -> Выбор курса
    $grade.change(function () {
        if ($('#timetable_wrapper').css('display') == 'block') {
            hideTimeTable();
        }

        if (!$grade.val()) {
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
    //$group.change(function () {
    //    var group = $group.val();
    //    if (!group) {
    //        hideTimeTable();
    //        return;
    //    }
    //
    //    // todo: kill getdata.php
    //    $.getJSON('getdata.php', {
    //        'data': 'schedule',
    //        'type': 'Group',
    //        'course': $grade.val(),
    //        'group': group
    //    }, function (json_schedule) {
    //        removeCells(); // Удаляем ячейки
    //        createTimeTable();
    //        outputSchedule(json_schedule.schedule, json_schedule.current_week);
    //    });
    //    $('.type_timetable').html(
    //        $grade.children('option:selected').text() + ', ' + $group.children('option:selected').text()
    //    );
    //
    //});


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

    //// Аудитория -> Выбор аудитории [Вывод расписания]
    //$room.change(function () {
    //    var room = $room.val();
    //    if (!room) {
    //        hideTimeTable();
    //        return;
    //    }
    //
    //    // todo: kill getdata.php
    //    $.getJSON('getdata.php', {
    //        'data': 'schedule',
    //        'type': 'Classroom',
    //        'id': room
    //    }, function (json_schedule) {
    //        removeCells(); // Удаляем ячейки
    //        createTimeTable();
    //        outputSchedule(json_schedule.schedule, json_schedule.current_week);
    //    });
    //    $('.type_timetable').html('Аудитория ' + $room.children('option:selected').text());
    //});


    //// Курс -> Выбор курса
    //$grade.change(function () {
    //    if ($('#timetable_wrapper').css('display') == 'block') {
    //        hideTimeTable();
    //    }
    //
    //    if ($grade.val() && $type.val() === 'course') {
    //        $day.removeAttr("disabled");
    //    } else {
    //        $day.attr("disabled", "disabled");
    //    }
    //    $day.val('0');
    //});


    // Курс -> Выбор курса -> Выбор дня [Вывод расписания]
    //$day.change(function () {
    //    var day = $day.val();
    //    if (!$day.val()) {
    //        hideTimeTable();
    //        return;
    //    }
    //
    //    // todo: kill getdata.php
    //    $.getJSON('getdata.php', {
    //        'data': 'schedule',
    //        'type': 'Course',
    //        'course': $grade.val(),
    //        'day': day
    //    }, function (data) {
    //        removeCells(); // Удаляем ячейки
    //        createTimeTableCourse2(data.schedule);
    //        outputSchedule(data.schedule, data.current_week);
    //    });
    //    $('.type_timetable').html('Курс ' + $grade.children('option:selected').text());
    //});





});
