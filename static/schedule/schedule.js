// Состояние веб-интерфейса. Возможно, закэшированное.
var appState = {};

// Версия 1.2.1
$(function () {

    var $group = $("#group");
    var $grade = $("#course");
    var $teacher = $("#teacher");
    var $day = $("#day");
    var $room = $("#auditory");
    var $type = $('#type');

    var $management = $('#management');

    var $table = $('table.timetable').first();
    var table = new Timetable($table);

    whichWeek();

    $(window).resize(function () {
        optimizationTimeTable();
    });

    var showList = {
        all: [$grade, $group, $teacher, $room, $day],
        group: [$grade, $group],
        teacher: [$teacher],
        auditory: [$room]
    };


    $type.change(function () {
        hideTimeTable();
        var type = $type.val();
        if (!type) {
            invalidate(showList.all);
            return;
        }

        loadGrades($grade);
        typeVisualization(showList, type);
    });


    $grade.change(function () {
        hideTimeTable();
        var grade = $grade.val();
        if (!grade) {
            invalidate([$group]);
            return;
        }

        loadGroups($grade.val(), $group);
    });


    // Группа -> Курс -> Выбор группы [Вывод расписания]
    $group.change(function () {
        hideTimeTable();
        var group = $group.val();
        if (!group) {
            return;
        }

        getJSON('schedule/group/' + group, function (data) {
            prepareData(data);
            table.draw(data);
            showTimeTable();
            optimizationTimeTable();
        });
        $('.type_timetable').html($teacher.children('option:selected').text());
    });



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
    }); // !$management.change
});
