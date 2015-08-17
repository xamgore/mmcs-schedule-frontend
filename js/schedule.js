// Состояние веб-интерфейса. Возможно, закэшированное.
var appState = {};

var backendURL = window.document.location.protocol + '//' + window.document.location.hostname + ':3000/';

function getJSON(route, callback)
{
    $.getJSON(backendURL + route, {} , callback);
}

function whichWeek()
{
    getJSON('schedule/week', function (data) {
        appState.type = data.type;
        var actualweek = appState.type ? 'верхняя неделя' : 'нижняя неделя';
        $('.week_now').text('Сейчас ' + actualweek);
    });
}

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
    var $management = $('#management');

    createTimeTable();

    whichWeek();

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
                $room.append('<option value="' + room.id + '">' + room.name + '</option>');
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

    /**
     * Часть про редактирование расписания
     */
    $.fn.manager = {};

    $.fn.manager.putTeacher = function()
    {
        var name = $('#teacherName').val();
        var degree = $('#teacherDegree').val();

        $.ajax({
            url: backendURL + 'teacher',
            type: 'PUT',
            data: "name=" + name + "&degree=" + degree,
            success: function(data) {
                $.fn.close_window();
            }
        });
    };

    $.fn.manager.putRoom = function()
    {
        var name = $('#roomName').val();

        $.ajax({
            url: backendURL + 'room',
            type: 'PUT',
            data: "name=" + name,
            success: function(data) {
                $.fn.close_window();
            }
        });
    };

    $.fn.manager.putGrade = function()
    {
        var num = $('#gradeNum').val();
        var degree = $('#gradeDegree').val();

        $.ajax({
            url: backendURL + 'grade',
            type: 'PUT',
            data: "num=" + num + "&degree=" + degree,
            success: function(data) {
                $.fn.close_window();
            }
        });
    };

    $.fn.manager.putGroup = function()
    {
        var name = $('#groupName').val();
        var num = $('#groupNum').val();
        var gradeID = $('#groupGradeID').val();

        $.ajax({
            url: backendURL + 'group',
            type: 'PUT',
            data: "name=" + name + "&num=" + num + "&gradeID=" + gradeID,
            success: function(data) {
                $.fn.close_window();
            }
        });
    };

    $management.change(function () {
        var action = $management.val();
        $management.val(0);

        switch (action) {
            case '1':
                var form = '<input id="teacherName" type="text" value="" placeholder="Имя"><br\>\
                <input id="teacherDegree" type="text" value="" placeholder="Степень"><br\>\
                <input type="button" value="Добавить" onclick="$.fn.manager.putTeacher()">';
                $.fn.open_window('Добавить преподавателя',form);

                break;

            case '2':
                var form = '<input id="roomName" type="text" value="" placeholder="Имя"><br\>\
                <input type="button" value="Добавить" onclick="$.fn.manager.putRoom()">';
                $.fn.open_window('Добавить аудиторию',form);

                break;

            case '3':
                var form = '<input id="gradeNum" type="text" value="" placeholder="Номер курса" \><br\>\
                <select id="gradeDegree">\
                <option>Степень обучения</option>\
                <option value="bachelor">bachelor</option> \
                <option value="master">master</option> \
                <option value="specialist">specialist</option> \
                </select><br\>\
                <input type="button" value="Добавить" onclick="$.fn.manager.putGrade()">';
                $.fn.open_window('Добавить курс',form);

                break;

            case '4':
                // name str, num int, gradeID int
                var form = '<input id="groupName" type="text" value="" placeholder="Имя"\><br\>\
                <input id="groupNum" type="text" value="" placeholder="Номер" \>\
                <select id="groupGradeID"><option>Курс</option></select>\
                <input type="button" value="Добавить" onclick="$.fn.manager.putGroup()">';
                $.fn.open_window('Добавить группу',form);

                getJSON('grade/list', function (data) {
                    var select = $('#groupGradeID');
                    $.each(data, function (i) {
                        select.append('<option value="' + data[i].id + '">' + data[i].degree + ' ' + data[i].num + '</option>');
                    });
                });

                break;
        }
    });
});
