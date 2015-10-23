// Проверка на History API
var hApi = !!(window.history && history.pushState);

function getUrl() {
    return window.location.pathname.substr(rDir.length);
}

function setUrl(url) {
    url = url ? url : ''; // Фикс
    console.log('set: ' + url);
    if (url == getUrl()) return;
    if (hApi) {
        if (getUrl()) {
            window.history.pushState({}, '', rDir + url);
        }
        else {
            window.history.replaceState({}, '', rDir + url);
        }
    }
    else {
        if (url) {
            window.location = rDir + url;
        }
    }
}

function toUrl(data) {
    // Если ничего не передано
    if (!data) {
        setUrl();
        return;
    }
    switch (data.type) {
        case 'Group': setUrl('group_' + data.course + '_' + data.group); break;
        case 'Teacher': setUrl('teacher_' + data.id); break;
        case 'Classroom': setUrl('auditory_' + data.id); break;
        default: setUrl();
    }
    return data;
}

function getCoords() {
    // Разбивка последнего сегмента url
    var url = getUrl().split('_');
    console.log('parse: ' + url);
    switch (url[0]) {
        case 'group': return {data: 'schedule', type: 'Group', course: url[1], group: url[2]}; break;
        case 'teacher': return {data: 'schedule', type: 'Teacher', id: url[1]}; break;
        case 'auditory': return {data: 'schedule', type: 'Classroom', id: url[1]}; break;
        default: setUrl(); return;
    }
}

$(function() {
    if (hApi) {
        // Кнопки назад/вперед
        $(window).bind('popstate', function () {
            loadUrl(getCoords());
        });
    }
});