var degreeMap = {
    bachelor: '',
    master: 'Магистратура, ',
    specialist: 'Специалитет, '
};

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




// ====================
//      grades
// ====================

var formGrade = function(grade) {
    var degree = degreeMap[grade.degree];
    return degree + grade.num + ' курс ';
};

var loadGrades = function($grade) {
    getJSON('grade/list', function(data) {

        $grade.html('<option value="0">Выберите курс:</option>'); // Сначала чистим select
        $.each(data, function (i, grade) {
            $grade.append('<option value="' + grade.id + '">' + formGrade(grade) + '</option>');
        });
    });
};




// ====================
//      groups
// ====================

var formGroup = function(group) {
    var name = group.num + ' группа';
    if (group.name !== 'NULL') {
        return group.name + ', ' + name;
    }
    return name;
};


var loadGroups = function(gradeID, $group) {
    getJSON('group/list/' + gradeID, function (data) {

        $group.removeAttr("disabled");
        $group.html('<option value="0">Выберите группу:</option>'); // Сначала чистим select
        $.each(data, function (i, group) {
            $group.append('<option value="' + group.id + '">' + formGroup(group) + '</option>');
        });
    });

};
