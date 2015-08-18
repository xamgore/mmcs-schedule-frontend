var days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
// Звонки (Андрей)


var timeList = [
    '8:00<br>8:45<br>-<br>8:50<br>9:35',
    '9:50<br>10:35<br>-<br>10:40<br>11:25',
    '11:55<br>12:40<br>-<br>12:45<br>13:30',
    '13:45<br>14:30<br>-<br>14:35<br>15:20',
    '15:50<br>16:35<br>-<br>16:40<br>17:25',
    '17:40<br>18:25<br>-<br>18:30<br>19:15'
];

function showTimeTable() {
    $('#timetable_wrapper').css('display', 'block');
    $('#welcome_wrapper').css('display', 'none');
    $('.print_schedule').css('display', 'block')
}

function hideTimeTable() {
    if ($('#timetable_wrapper').css('display') == 'block') {
        $('#timetable_wrapper').css('display', 'none');
        $('#welcome_wrapper').css('display', 'block');
        $('.print_schedule').css('display', 'none');
    }
}


// Костыль (чтобы вертикальная линия была по размеру ячейки)
function optimizationTimeTable() {
    $('.subject_cell').each(function () {
        var $subgroups = $(this).children('.table_subgroups');
        var $divider = $(this).children('.table_horizontal_divider');
        var timeTableHeight = $(this).height();

        [$subgroups, $divider].forEach(function(elem) { // adjust height
            var height = elem.height();
            if (height != null && height < timeTableHeight) {
                elem.css('height', timeTableHeight + 2); // todo: +2 wtf?
            }
        });

        var $subjShort = $(this).find('.subject_short');
        if ($subjShort.length) {
            var $subj = $(this).find('.subject');
            var tableWidth = $(this).width();
            // todo: magic constant?
            var subjs = (tableWidth < 180) ? [$subjShort, $subj] : [$subj, $subjShort];

            subjs[0].css('display', 'block');
            subjs[1].css('display', 'none');
        }
    });
}


