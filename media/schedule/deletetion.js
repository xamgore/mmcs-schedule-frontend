$(function () {
    'use strict';

    var $management = $('#management');
    var $table = $('.timetable_wrapper');
    var deleteMode = false;


    $management.change(function () {
        var deleteModeVal = 6;
        if ($(this).val() != deleteModeVal) {
            return;
        }

        var opt = $(this).find('option[value="' + deleteModeVal +'"]');
        var state = opt.attr('class');
        if (state === 'deleteon') {
            opt.attr('class', 'deleteoff');
            opt.html('delete mode off');
            deleteMode = false;
            $management.css('border-color', '');
        } else {
            opt.attr('class', 'deleteon');
            opt.html('delete mode on');
            deleteMode = true;
            $management.css('border-color', 'red');
        }
    });


    $table.on('click', '.uberCell', function () {
        if (!deleteMode) {
            return;
        }

        var $cell = $(this);
        var lessonID = +$cell.attr('id').replace(/^lesID_/, '');
        if (!confirm('Удалить урок? (lessonID: '+ lessonID + ')')) {
            return;
        }

        $.ajax({
            url: $.schedule.backendURL + 'schedule/' + lessonID,
            type: 'DELETE',
            xhrFields: {withCredentials: true},
            crossDomain: true,
            success: function (result) {
                if (result.ok) {
                    $cell.html('');
                }
            }
        });
    });
});
