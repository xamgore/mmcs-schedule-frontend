$(function () {
    'use strict';

    var redrawMultiselect = function() {
        $('.select-multiple').multiselect({
            buttonContainer: '<div style="margin: 0 auto;"></div>',
            buttonWidth: '90%'
        });
        $('.select-single').multiselect({
            buttonContainer: '<div style="margin: 0 auto;"></div>',
            buttonWidth: '90%',
            enableFiltering: true,
            filterPlaceholder: 'Search for something...'
        });
    };

    redrawMultiselect();

    var $day = $('#day');
    var $times = $('#time');
    var rawTimes = [];
    var $split = $('#split');
    var $grades = $('#grades');
    var $groups = $('#groups');

    loader.times(function (data) {
        $times.html('');
        $.each(data, function (i, time) {
            var begTime = time.cbeg.hours + ':' + (time.cbeg.minutes || '00');
            var endTime = time.cend.hours + ':' + (time.cend.minutes || '00');
            rawTimes[i] = {beg: begTime, end: endTime};
            $times.append('<option value=' + i + '>' + begTime  + ' to ' + endTime + '</option>');
        });
        $times.multiselect('rebuild');
    });

    loader.grades(function (data) {
        $grades.html(''); // Сначала чистим select
        $.each(data, function (i, gradeInfo) {
            $grades.append(menu.gradeOption(gradeInfo));
        });
        $grades.multiselect('rebuild');
        $grades.change();
    });

    $grades.change(function () {
        var grade = $grades.val();
        loader.groups(grade, function (data) {
            $groups.html(''); // Сначала чистим select
            $.each(data, function (i, groupInfo) {
                $groups.append(menu.groupOption(groupInfo));
            });
            $groups.multiselect('rebuild');
        });
    });

    //#######################

    var loadDataToSubjectRow = function(row) {
        loader.subjects(function (data) {
            var $subjects = row.find('.row-subject>select');
            $subjects.html('');
            $.each(data, function (i, subjectInfo) {
                $subjects.append(menu.subjectOption(subjectInfo));
            });
            $subjects.multiselect('rebuild');
        });
    };

    var loadDataToTeacherRow = function(row) {
        loader.teachers(function(data) {
            var $teachers = row.find('.teacher');
            $teachers.html('');
            $.each(data, function (i, teacherInfo) {
                $teachers.append(menu.teacherOption(teacherInfo));
            });
            $teachers.multiselect('rebuild');
        });
        loader.rooms(function(data) {
            var $rooms = row.find('.room');
            $rooms.html('');
            $.each(data, function (i, roomInfo) {
                $rooms.append(menu.roomOption(roomInfo));
            });
            $rooms.multiselect('rebuild');
        });
    };

    $.fn.addTeacher = function(button){
        var buttonRow = button.parent().parent();
        /*var $lastRow = buttonRow.prev();
        $lastRow.clone(false, false).insertAfter($lastRow);*/

        var newRow = $('<!-- ЭТУ СТРОКУ ДОБАВЛЯТЬ ДЛЯ НОВЫХ ПАРАМЕТРОВ -->\
            <div class="row row-params">\
                <div class="col-md-3">\
                    <select class="select-single input-large teacher"></select>\
                </div>\
                <div class="col-md-3">\
                    <select class="select-single input-large room"></select>\
                </div>\
                <div class="col-md-3">\
                    <input type="text" class="input-time">\
                </div>\
                <div class="col-md-3">\
                    <button type="button" class="btn btn-primary btn-del-params"\
                            onclick="$.fn.delTeacher($(this));">\
                        <span class="glyphicon glyphicon-remove" aria-hidden="true"></span> \
                                Удалить преподавателя\
                    </button>\
                </div>\
            </div> \
            <!-- ========================================== -->').insertBefore(buttonRow);
        loadDataToTeacherRow(newRow);

        redrawMultiselect();
    };

    $.fn.delTeacher = function(button) {
        var buttonRow = button.parent().parent();
        buttonRow.remove();
    };

    $.fn.addSubject = function(button) {
        var buttonRow = button.parent().parent();
        var newRow = $('<!-- ЭТУ СТРОКУ ДОБАВЛЯТЬ ДЛЯ НОВОГО ПРЕДМЕТА -->\
            <div class="row row-control">\
                <div class="col-md-2 col-subject">\
                    <div class="row row-subject-head">\
                        <div class="col-md-12">Предмет</div>\
                    </div>\
                    <div class="row row-subject">\
                        <select class="select-single select-subject input-large"></select>\
                    </div>\
                </div>\
                <div class="col-md-10">\
                    <div class="row row-params-head">\
                        <div class="col-md-3">Преподаватель</div>\
                        <div class="col-md-3">Кабинет</div>\
                        <div class="col-md-3">Другое время</div>\
                        <div class="col-md-3">\
                            <button type="button" class="btn btn-primary btn-del-subject"\
                                    onclick="$.fn.delSubject($(this));">\
                                <span class="glyphicon glyphicon-remove" aria-hidden="true"></span> \
                                Удалить ячейку\
                            </button>\
                        </div>\
                    </div>\
                    <div class="row row-btn-add">\
                        <div class="col-md-9">\
                            <button type="button" class="btn btn-primary btn-add-params"\
                                    onclick="$.fn.addTeacher($(this));">\
                                <span class="glyphicon glyphicon-plus" aria-hidden="true"></span> \
                                Добавить преподавателя\
                            </button>\
                        </div>\
                    </div>\
                </div>\
            </div>\
            <!-- ========================================== -->').insertBefore(buttonRow);

        $.fn.addTeacher(newRow.find('.btn-add-params'));

        loadDataToSubjectRow(newRow);

        redrawMultiselect();
    };

    $.fn.delSubject = function(button) {
        var buttonRow = button.parent().parent().parent().parent();
        buttonRow.remove();
    };

    // Сразу добавляем первый предмет
    $('.btn-add-subject').click();

    //#######################################

    $.fn.saveCurriculum = function() {
        var data = {
            lesson: {
                day: $day.val(),
                beg: rawTimes[$times.val()].beg,
                end: rawTimes[$times.val()].end,
                split: $split.val(),
                subcount: 0
            },
            groups: $groups.val(),
            subjects: []
        };

        var subnum = 0;
        $('.container-control > :not(.row-btn-add)').each(function(i, subjelem) {
            var subjRow = $(subjelem);
            var subject = subjRow.find('.select-subject').val();
            subjRow.find('.row-params').each(function(j, elem){
                ++subnum;

                var teacherRow = $(elem);
                var room = teacherRow.find('.room').val();
                var teacher = teacherRow.find('.teacher').val();

                data.subjects.push({
                    subnum: subnum,
                    subject: subject,
                    room: room,
                    teacher: teacher
                });
            });
        });

        data.lesson.subcount = subnum;
        data.curricula = JSON.stringify(data.subjects);

        $.ajax({
            url: $.schedule.backendURL + 'schedule/lesson',
            type: 'PUT',
            data: data,
            xhrFields: {withCredentials: true},
            crossDomain: true,
            success: function (data) {
                console.log('success');
            }
        });

        //location.reload();
    };
});
