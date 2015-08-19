$(function () {
    'use strict';
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

    // var $day = $('#day');
    var $times = $('#time');
    var $grades = $('#grades');
    var $groups = $('#groups');


    loader.times(function (data) {
        $times.html('');
        $.each(data, function (i, time) {
            var begTime = time.cbeg.hours + ':' + (time.cbeg.minutes || '00');
            var endTime = time.cend.hours + ':' + (time.cend.minutes || '00');
            $times.append('<option>' + begTime  + ' to ' + endTime + '</option>');
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


});
