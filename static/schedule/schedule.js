// Версия 1.2.1
$(function () {
    var $group = $("#group");
    var $grade = $("#course");
    var $teacher = $("#teacher");
    var $day = $("#day");
    var $room = $("#auditory");
    var $type = $('#type');

    var $management = $('#management');
    var $table = $('.timetable_wrapper');


    var tableGen = new Generator({week: 0}); // 0 - upper, 1 - lower
    var table = new Timetable(tableGen, {
        base: $table
    });

    loader.week($('.week_now'), function(week) {
        'use strict';
        $.schedule.state.type = week;
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

        loader.grades(function (data) {
            'use strict';
            $grade.html('<option value="0">Выберите курс:</option>'); // Сначала чистим select
            $.each(data, function (i, gradeInfo) {
                $grade.append(menu.gradeOption(gradeInfo));
            });
        });
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
            table.draw(data);
            table.show(true);
            table.optimize();
        });
        $('.type_timetable').html($teacher.children('option:selected').text());
    });


    /**
     * Часть про редактирование расписания
     */
    $.fn.manager = {};
    $.schedule.manager = {};

    var managerAuth = $('#management_auth');
    var managerList = $('#management');

    $.schedule.manager.auth = function() {
        var login = $('#login').val();
        var pass = $('#pass').val();

        $.ajax({
            url: $.schedule.backendURL + 'auth/login',
            type: 'GET',
            data: {
                login: login,
                pass: pass
            },
            xhrFields: {withCredentials: true},
            crossDomain: true,
            success: function (data) {
                $.schedule.manager.redraw();
                $.fn.close_window();
            },
            error: function(jqXHR, status, error) {
                console.log(status);
            }
        });
    };

    $.schedule.manager.redraw = function() {
        $.ajax({
            url: $.schedule.backendURL + 'auth/status',
            type: 'GET',
            xhrFields: {withCredentials: true},
            crossDomain: true,
            success: function (data) {
                if (data.status === 'manager')
                    $.schedule.state.authorize = true;
                else if (data.status === 'just user')
                    $.schedule.state.authorize = false;


                if ($.schedule.state.authorize) {
                    managerAuth.css('display', 'none');
                    managerList.css('display', 'block');
                }
                else {
                    managerAuth.css('display', 'block');
                    managerList.css('display', 'none');
                }
            }
        });
    };

    $.schedule.manager.redraw();

    managerAuth.click(function(){
        var form = '<input id="login" type="text" value="" placeholder="Логин"\><br\>\
                <input id="pass" type="password" value="" placeholder="Пароль" \>\
                <input type="button" value="Войти" onclick="$.schedule.manager.auth()">';
        $.fn.open_window('Авторизация', form);
    });

    $.fn.manager.putTeacher = function () {
        'use strict';
        var name = $('#teacherName').val();
        var degree = $('#teacherDegree').val();

        $.ajax({
            url: $.schedule.backendURL + 'teacher',
            type: 'PUT',
            data: "name=" + name + "&degree=" + degree,
            success: function (data) {
                $.fn.close_window();
            }
        });
    };

    $.fn.manager.putRoom = function () {
        'use strict';
        var name = $('#roomName').val();

        $.ajax({
            url: $.schedule.backendURL + 'room',
            type: 'PUT',
            data: "name=" + name,
            success: function (data) {
                $.fn.close_window();
            }
        });
    };

    $.fn.manager.putGrade = function () {
        'use strict';
        var num = $('#gradeNum').val();
        var degree = $('#gradeDegree').val();

        $.ajax({
            url: $.schedule.backendURL + 'grade',
            type: 'PUT',
            data: "num=" + num + "&degree=" + degree,
            success: function (data) {
                $.fn.close_window();
            }
        });
    };

    $.fn.manager.putGroup = function () {
        'use strict';
        var name = $('#groupName').val();
        var num = $('#groupNum').val();
        var gradeID = $('#groupGradeID').val();

        $.ajax({
            url: $.schedule.backendURL + 'group',
            type: 'PUT',
            data: "name=" + name + "&num=" + num + "&gradeID=" + gradeID,
            success: function (data) {
                $.fn.close_window();
            }
        });
    };

    $management.change(function () {
        'use strict';
        var action = $management.val();
        $management.val(0);

        switch (action) {
            case '1':
                var form = '<input id="teacherName" type="text" value="" placeholder="Имя"><br\>\
                <input id="teacherDegree" type="text" value="" placeholder="Степень"><br\>\
                <input type="button" value="Добавить" onclick="$.fn.manager.putTeacher()">';
                $.fn.open_window('Добавить преподавателя', form);

                break;

            case '2':
                var form = '<input id="roomName" type="text" value="" placeholder="Имя"><br\>\
                <input type="button" value="Добавить" onclick="$.fn.manager.putRoom()">';
                $.fn.open_window('Добавить аудиторию', form);

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
                $.fn.open_window('Добавить курс', form);

                break;

            case '4':
                // name str, num int, gradeID int
                    var form = '<input id="groupName" type="text" value="" placeholder="Имя"\><br\>\
                <input id="groupNum" type="text" value="" placeholder="Номер" \>\
                <select id="groupGradeID"><option>Курс</option></select>\
                <input type="button" value="Добавить" onclick="$.fn.manager.putGroup()">';
                $.fn.open_window('Добавить группу', form);

                menu.getJSON('grade/list', function (data) {
                    var select = $('#groupGradeID');
                    $.each(data, function (i) {
                        select.append('<option value="' + data[i].id + '">' + data[i].degree + ' ' + data[i].num + '</option>');
                    });
                });

                break;

            case 'logout':
                $.ajax({
                    url: $.schedule.backendURL + 'auth/logout',
                    type: 'GET',
                    xhrFields: {withCredentials: true},
                    crossDomain: true,
                    success: function (data) {
                        $.schedule.manager.redraw();
                    }
                });
                break;
        }
    }); // !$management.change
});
