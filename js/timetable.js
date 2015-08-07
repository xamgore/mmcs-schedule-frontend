var days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
// Звонки (Андрей)
var time = ['', '', '', '', '', '', ''];

function is_object(obj) {
    return (typeof obj == "object");
}


function showTimeTable() {
    $('#timetable_wrapper').css('display', 'block');
    $('#welcome_wrapper').css('display', 'none');
    $('.print_schedule').css('display', 'block')
}

function hideTimeTable() {
    $('#timetable_wrapper').css('display', 'none');
    $('#welcome_wrapper').css('display', 'block');
    $('.print_schedule').css('display', 'none')
}

// Чистим ячейки
function clearCells() {
    $('.subject_cell').each(function () {
        $(this).html('');
    });
}

// Удаляем ячейки
function removeCells() {
    $('.timetable td').each(function () {
        $(this).remove();
    });
}

// Создаем ячейки для таблицы (группа, преподаватель, аудитория)
function createTimeTable() {
    var i, j;
    var $timeTable = $('.timetable .tr_top');

    $timeTable.append('<td></td>');
    for (i = 0; i < 6; ++i) {
        $timeTable.append('<td class="top" width="16%">' + days[i] + '</td>');
    }

    for (j = 1; j <= 6; ++j) {
        var $timeTr = $('.timetable .tr_' + j);

        $timeTr.append('<td class="time">' + time[j - 1] + '</td>');
        for (i = 1; i <= 6; ++i) {
            $timeTr.append('<td class="' + j + '_' + i + '"></td>');
        }
    }
}


// Создаем ячейки для таблицы (для курса)
function createTimeTableCourse(n) {
    var width = Math.floor(100 / n);
    for (var i = 1; i <= n; i++)
        if (i == 1)
            $('.timetable .tr_top').append('<td></td>').append('<td class="top" width="' + width + '%">Группа ' + i + '</td>');
        else $('.timetable .tr_top').append('<td class="top" width="' + width + '%">Группа ' + i + '</td>');

    for (var j = 1; j <= 6; j++)
        for (var i = 1; i <= n; i++)
            if (i == 1)
                $('.timetable .tr_' + j).append('<td class="time">' + time[j - 1] + '</td>').append('<td class="' + j + '_' + i + '"></td>');
            else $('.timetable .tr_' + j).append('<td class="' + j + '_' + i + '"></td>');
}

function createTimeTableCourse2(data) {
    var counter = 0;

    for (var i = 1; i <= data['groups_count']; ++i) {
        if (data[i] !== undefined) {
            ++counter;
        }
    }
    if (counter == 0) {
        createTimeTableCourse(data['groups_count']);
        return;
    }

    var width = Math.floor(100 / counter);
    if (counter >= 1) {
        $('.timetable .tr_top').append('<td></td>');
    }

    $.each(data, function (i) {
        if (i >= 1) {
            $('.timetable .tr_top').append('<td class="top" width="' + width + '%">Группа ' + i + '</td>');
        }
    });

    for (var j = 1; j <= 6; j++) {
        $('.timetable .tr_' + j).append('<td class="time">' + time[j - 1] + '</td>');
        $.each(data, function (i) {
            if (i >= 1) {
                $('.timetable .tr_' + j).append('<td class="' + j + '_' + i + '"></td>');
            }
        });
    }
}

// Костыль (чтобы вертикальная линия была по размеру ячейки)
function optimizationTimeTable() {
    $('.subject_cell').each(function () {
        if (($(this).children('.table_subgroups').height() < $(this).height()) && ($(this).children('.table_subgroups').height() != null))
            $(this).children('.table_subgroups').css('height', $(this).height() + 2);
        if (($(this).children('.table_horizontal_divider').height() < $(this).height()) && ($(this).children('.table_horizontal_divider').height() != null))
            $(this).children('.table_horizontal_divider').css('height', $(this).height() + 2);
        if ($(this).find('.subject_short').length)
            if ($(this).width() < 180) {
                $(this).find('.subject').css('display', 'none');
                if ($(this).find('.subject_short').css('display') == 'none')
                    $(this).find('.subject_short').css('display', 'block');
            }
            else {
                $(this).find('.subject_short').css('display', 'none');
                if ($(this).find('.subject').css('display') == 'none')
                    $(this).find('.subject').css('display', 'block');
            }
    });
}


function appendLecture(data, class_str) {
    if (data.notice)
        $(class_str).append('<p class="notice">' + data.notice + '</p>');
    if (data.attention)
        $(class_str).append('<p class="attention">' + data.attention + '</p>');
    if (data.subject)
        $(class_str).append('<p class="subject">' + data.subject + '</p>');
    if (data.subject_short)
        $(class_str).append('<p class="subject_short">' + data.subject_short + '</p>');
    if (data.lectuer)
        $(class_str).append('<p class="lectuer">' + data.lectuer + '</p>');
    if (is_object(data.groups)) {
        $(class_str).append('<p class="groups"></p>');
        $.each(data.groups, function (i) {
            if (i < parseInt(data.groups_count))
                $(class_str + ' .groups').append(data.groups[i] + ', ');
            else
                $(class_str + ' .groups').append(data.groups[i]);
        });
    }
    if (data.auditory)
        $(class_str).append('<p class="auditory">' + data.auditory + '</p>');
}

function split_week(data, class_str, now_week) {
    if (now_week == 'up')
        week_cells = '<tr><td class="upper_week"></td></tr><tr><td class="lower_week inactive_week"></td></tr>';
    else
        week_cells = '<tr><td class="upper_week inactive_week"></td></tr><tr><td class="lower_week"></td></tr>';
    $(class_str).append('<table class="table_horizontal_divider" border="0" cellspacing="0" cellpadding="0">' + week_cells + '</table>');
    if (is_object(data.up)) {
        appendLecture(data.up, class_str + ' .upper_week');
    }
    if (is_object(data.down)) {
        appendLecture(data.down, class_str + ' .lower_week');
    }
}


function subgroup(data, i, j, now_week) {
    // data - фрагмент JSON массива
    // i - день
    // j - номер пары
    $('.' + j + '_' + i).append('<table class="table_subgroups" border="0" cellspacing="0" cellpadding="0"><tr class="subgroups"></tr></table>');
    $('.' + j + '_' + i + ' .subgroups').append('<td class="first_subgroup"></td>');
    if (is_object(data[1])) {
        if (data[1].split_week == 'true') {
            split_week(data[1], '.' + j + '_' + i + ' .subgroups .first_subgroup', now_week);
        } else {
            appendLecture(data[1], '.' + j + '_' + i + ' .subgroups .first_subgroup');
        }
    }
    $('.' + j + '_' + i + ' .subgroups').append('<td class="second_subgroup"></td>');
    if (is_object(data[2])) {
        if (data[2].split_week == 'true') {
            split_week(data[2], '.' + j + '_' + i + ' .subgroups .second_subgroup', now_week);
        } else {
            appendLecture(data[2], '.' + j + '_' + i + ' .subgroups .second_subgroup');
        }
    }
    if (is_object(data[3])) {
        $('.' + j + '_' + i + ' .subgroups').append('<td class="third_subgroup"></td>');
        if (data[3].split_week == 'true') {
            split_week(data[3], '.' + j + '_' + i + ' .subgroups .third_subgroup', now_week);
        } else {
            appendLecture(data[3], '.' + j + '_' + i + ' .subgroups .third_subgroup');
        }
        $('.' + j + '_' + i + ' .table_subgroups .subgroups .first_subgroup').width('33%');
        $('.' + j + '_' + i + ' .table_subgroups .subgroups .second_subgroup').width('33%');
        // third_group менять не надо, ибо в css width: 33%;
    }
}

// Вывод расписания
function outputSchedule(data, now_week) {
    clearCells(); // Чистим ячейки
    console.log(data);
    $.each(data, function (i) { // День
        if (is_object(data[i])) {
            $.each(data[i], function (j) { // Пара
                if (is_object(data[i][j].subgroups)) {
                    subgroup(data[i][j].subgroups, i, j, now_week); // Подгруппы
                    $('.' + j + '_' + i).attr('class', +j + '_' + i + ' subject_cell');
                }
                else {
                    if (data[i][j].split_week == 'true') {
                        split_week(data[i][j], '.' + j + '_' + i, now_week);
                        $('.' + j + '_' + i).attr('class', +j + '_' + i + ' subject_cell');
                    }
                    else {
                        $('.' + j + '_' + i).append('<div class="no_subgroups"></div>');
                        appendLecture(data[i][j], '.' + j + '_' + i + ' .no_subgroups');
                        $('.' + j + '_' + i).attr('class', +j + '_' + i + ' subject_cell');
                    }
                }
            });
        }
    });
    showTimeTable();
    optimizationTimeTable();
}
