// Версия 1.2.1
$(function() {
	// j - строка таблицы
	// i - столбец таблицы

        // Звонки (Андрей)
        var time = new Array('', '', '', '', '', '', '');
	//$.getJSON('getdata.php', {'data': 'list', 'type': 'LessonTime'}, function(data){
    $.getJSON('http://schedule.local:3000/lessonTime', function(data){
            $.each(data, function(i){
                 time[i-1] = data[i].BeginTime+'<br>'+data[i].BreakBgTime+'<br>-<br>'+data[i].BreakEndTime+'<br>'+data[i].EndTime;
            });
        });
	
	var days = new Array('Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота');

	function is_object(obj){
		return (typeof obj == "object");
	}
	
	function showTimeTable(){
		$('#timetable_wrapper').css('display', 'block');
		$('#welcome_wrapper').css('display', 'none');
			$('.print_schedule').css('display', 'block')
	}
	
	function hideTimeTable(){
		$('#timetable_wrapper').css('display', 'none');
		$('#welcome_wrapper').css('display', 'block');
			$('.print_schedule').css('display', 'none')
	}
	
	// Чистим ячейки
	function clearCells() {
		$('.subject_cell').each(function(){
			$(this).html('');
		});
	}

	// Удаляем ячейки
	function removeCells() {
		$('.timetable td').each(function(){
			$(this).remove();
		});
	}
	
	// Создаем ячейки для таблицы (группа, преподаватель, аудитория)
	function createTimeTable() {
		for (var i = 1; i <= 6; i++)
			if (i == 1)
				$('.timetable .tr_top').append('<td></td>').append('<td class="top" width="16%">'+days[i-1]+'</td>');
			else $('.timetable .tr_top').append('<td class="top" width="16%">'+days[i-1]+'</td>');
			
		for (var j = 1; j <= 6; j++)
			for (var i = 1; i <= 6; i++)
				if (i == 1)
					$('.timetable .tr_'+j).append('<td class="time">'+time[j-1]+'</td>').append('<td class="'+j+'_'+i+'"></td>');
				else $('.timetable .tr_'+j).append('<td class="'+j+'_'+i+'"></td>');
	}

	
	// Создаем ячейки для таблицы (для курса)
	function createTimeTableCourse(n) {
		var width = Math.floor(100/n);
		for (var i = 1; i <= n; i++)
			if (i == 1)
				$('.timetable .tr_top').append('<td></td>').append('<td class="top" width="'+width+'%">Группа '+i+'</td>');
			else $('.timetable .tr_top').append('<td class="top" width="'+width+'%">Группа '+i+'</td>');

		for (var j = 1; j <= 6; j++)
			for (var i = 1; i <= n; i++)
				if (i == 1)
					$('.timetable .tr_'+j).append('<td class="time">'+time[j-1]+'</td>').append('<td class="'+j+'_'+i+'"></td>');
				else $('.timetable .tr_'+j).append('<td class="'+j+'_'+i+'"></td>');
	}

	function createTimeTableCourse2(data) {
		var counter=0;


  		for (var i=1; i<=data['groups_count']; ++i) {
  			if (data[i] !== undefined) {
  				++counter;
  			}
  		}
  		if (counter == 0) {
  			createTimeTableCourse(data['groups_count']);
  			return;
  		}

		var width = Math.floor(100/counter);
		if (counter >= 1) {
			$('.timetable .tr_top').append('<td></td>');
		}

		$.each(data, function(i) {
			if (i >= 1) {
				$('.timetable .tr_top').append('<td class="top" width="'+width+'%">Группа '+i+'</td>');
			}
		});

		for (var j = 1; j <= 6; j++) {
			$('.timetable .tr_'+j).append('<td class="time">'+time[j-1]+'</td>');
			$.each(data, function(i) {
				if (i >= 1) {
					$('.timetable .tr_'+j).append('<td class="'+j+'_'+i+'"></td>');
				}
			});
		}
	}
	
	// Костыль (чтобы вертикальная линия была по размеру ячейки)
	function optimizationTimeTable(){
		$('.subject_cell').each(function() {
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
	
	function appendLecture(data, class_str){
		if (data.notice)
			$(class_str).append('<p class="notice">'+data.notice+'</p>');
		if (data.attention)
			$(class_str).append('<p class="attention">'+data.attention+'</p>');
		if (data.subject)
			$(class_str).append('<p class="subject">'+data.subject+'</p>');
		if (data.subject_short)
			$(class_str).append('<p class="subject_short">'+data.subject_short+'</p>');
		if (data.lectuer)
			$(class_str).append('<p class="lectuer">'+data.lectuer+'</p>');
		if (is_object(data.groups)){
			$(class_str).append('<p class="groups"></p>');
			$.each(data.groups, function(i) {
				if (i < parseInt(data.groups_count))
					$(class_str+' .groups').append(data.groups[i]+', ');
				else
					$(class_str+' .groups').append(data.groups[i]);
			});
		}
		if (data.auditory)
			$(class_str).append('<p class="auditory">'+data.auditory+'</p>');
	}
	
	function split_week(data, class_str, now_week) {
		if (now_week == 'up')
			week_cells = '<tr><td class="upper_week"></td></tr><tr><td class="lower_week inactive_week"></td></tr>';
		else
			week_cells = '<tr><td class="upper_week inactive_week"></td></tr><tr><td class="lower_week"></td></tr>';
		$(class_str).append('<table class="table_horizontal_divider" border="0" cellspacing="0" cellpadding="0">'+week_cells+'</table>');
		if (is_object(data.up)) {
			appendLecture(data.up, class_str+' .upper_week');
		}
		if (is_object(data.down)) {
			appendLecture(data.down, class_str+' .lower_week');
		}
	}
	
	function subgroup(data, i, j, now_week){
		// data - фрагмент JSON массива
		// i - день
		// j - номер пары
		$('.'+j+'_'+i).append('<table class="table_subgroups" border="0" cellspacing="0" cellpadding="0"><tr class="subgroups"></tr></table>');
		$('.'+j+'_'+i+' .subgroups').append('<td class="first_subgroup"></td>');
		if (is_object(data[1])) {
			if (data[1].split_week == 'true') {
				split_week(data[1], '.'+j+'_'+i+' .subgroups .first_subgroup', now_week);
			} else {
				appendLecture(data[1], '.'+j+'_'+i+' .subgroups .first_subgroup');
			}
		}
		$('.'+j+'_'+i+' .subgroups').append('<td class="second_subgroup"></td>');
		if (is_object(data[2])) {
			if (data[2].split_week == 'true') {
				split_week(data[2], '.'+j+'_'+i+' .subgroups .second_subgroup', now_week);
			} else {
				appendLecture(data[2], '.'+j+'_'+i+' .subgroups .second_subgroup');
			}
		}
		if (is_object(data[3])) {
			$('.'+j+'_'+i+' .subgroups').append('<td class="third_subgroup"></td>');
			if (data[3].split_week == 'true') {
				split_week(data[3], '.'+j+'_'+i+' .subgroups .third_subgroup', now_week);
			} else {			
				appendLecture(data[3], '.'+j+'_'+i+' .subgroups .third_subgroup');
			}
			$('.'+j+'_'+i+' .table_subgroups .subgroups .first_subgroup').width('33%');
			$('.'+j+'_'+i+' .table_subgroups .subgroups .second_subgroup').width('33%');
			// third_group менять не надо, ибо в css width: 33%;
		}
	}
	
	// Вывод расписания
	function outputSchedule(data, now_week) {
		clearCells(); // Чистим ячейки
		console.log(data);
		$.each(data, function(i){ // День
			if (is_object(data[i])) {
				$.each(data[i], function(j){ // Пара
					if (is_object(data[i][j].subgroups)) {
						subgroup(data[i][j].subgroups, i, j, now_week); // Подгруппы
						$('.'+j+'_'+i).attr('class', +j+'_'+i+' subject_cell');
					}
					else {
						if (data[i][j].split_week == 'true') {
							split_week(data[i][j], '.'+j+'_'+i, now_week);
							$('.'+j+'_'+i).attr('class', +j+'_'+i+' subject_cell');
						}
						else {
							$('.'+j+'_'+i).append('<div class="no_subgroups"></div>');
							appendLecture(data[i][j], '.'+j+'_'+i+' .no_subgroups');
							$('.'+j+'_'+i).attr('class', +j+'_'+i+' subject_cell');
						}
					}
				});
			}
		});
		showTimeTable();
		optimizationTimeTable();
	}
	
	// Выбор типа расписания
	$('#type').change(function(){
		if ($('#type option:selected').val() != '0') {
			switch ($('#type option:selected').val())
			{
				case 'group':
					$("#course").removeAttr("disabled");
					$.getJSON('getdata.php', {'data': 'list', 'type': 'Courses'}, function(data){
						$("#course").html('<option value="0">Выберите курс:</option>'); // Сначала чистим select
						$.each(data, function(i){
							$("#course").append('<option value="'+data[i].id+'">'+data[i].title+'</option>');
						});
					});
					$('#group [value=0]').attr("selected", "selected");	// Убирает баг
					$("#group").attr("disabled", "disabled"); // Убирает баг
					$("#course").show();
					$("#group").show();
					$("#teacher").hide();
					$("#auditory").hide();
					$("#day").hide();
				break;
				case 'teacher':
					$("#teacher").removeAttr("disabled");
					//$.getJSON('getdata.php', {'data': 'list', 'type': 'Teachers'}, function(data){
                    $.getJSON('http://schedule.local:3000/teachers/list', function(data){
                        $("#teacher").html('<option value="0">Выберите преподавателя:</option>'); // Сначала чистим select
                        $.each(data, function(i){
                            $("#teacher").append('<option value="'+data[i].id+'">'+data[i].title+'</option>');
                        });
                    });
					$("#course").hide();
					$("#group").hide();
					$("#teacher").show();
					$("#auditory").hide();
					$("#day").hide();
				break;
				case 'auditory':
					$("#auditory").removeAttr("disabled");
					$.getJSON('getdata.php', {'data': 'list', 'type': 'Classrooms'}, function(data){
						$("#auditory").html('<option value="0">Выберите аудиторию:</option>'); // Сначала чистим select
						$.each(data, function(i){
							$("#auditory").append('<option value="'+data[i].id+'">'+data[i].title+'</option>');
						});
					});
					$("#course").hide();
					$("#group").hide();
					$("#teacher").hide();
					$("#auditory").show();
					$("#day").hide();
				break;
				case 'course':
					$("#course").removeAttr("disabled");
					$.getJSON('getdata.php', {'data': 'list', 'type': 'Courses'}, function(data){
						$("#course").html('<option value="0">Выберите курс:</option>'); // Сначала чистим select
						$.each(data, function(i){
							$("#course").append('<option value="'+data[i].id+'">'+data[i].title+'</option>');
						});
					});
					$('#group [value=0]').attr("selected", "selected");	// Убирает баг
					$("#group").attr("disabled", "disabled"); // Убирает баг
					$("#course").show();
					$("#group").hide();
					$("#teacher").hide();
					$("#auditory").hide();
					$("#day").show();
				break;
			}
		}
		else {
			$("#course").attr("disabled", "disabled");
			$("#group").attr("disabled", "disabled");
			$('#course [value=0]').attr("selected", "selected");
			$('#group [value=0]').attr("selected", "selected");	
			$("#teacher").attr("disabled", "disabled");
			$('#teacher [value=0]').attr("selected", "selected");
			$("#auditory").attr("disabled", "disabled");
			$('#auditory [value=0]').attr("selected", "selected");
			$("#day").attr("disabled", "disabled");
			$('#day [value=0]').attr("selected", "selected");
		}
			
		if ($('#timetable_wrapper').css('display') == 'block')
			hideTimeTable();
	});
	// Группа -> Выбор курса
	$('#course').change(function(){
		if (($('#course option:selected').val() != '0') && ($('#type option:selected').val() == 'group')) {
			$.getJSON('getdata.php', {'data': 'list', 'type': 'Groups', 'course': $('#course option:selected').val()}, function(data){
				$("#group").removeAttr("disabled");
				$("#group").html('<option value="0">Выберите группу:</option>'); // Сначала чистим select
				$.each(data, function(i){
					$("#group").append('<option value="'+data[i].group+'">'+data[i].title+'</option>');
				});
			});
		}
		else {
			$("#group").attr("disabled", "disabled");
			$("#group [value='0']").attr("selected", "selected");
		}
		
		if ($('#timetable_wrapper').css('display') == 'block')
			hideTimeTable();
	});
	// Группа -> Курс -> Выбор группы [Вывод расписания]
	$('#group').change(function(){
		if ($('#group option:selected').val() != '0') {
			$.getJSON('getdata.php', {'data': 'schedule', 'type': 'Group', 'course': $('#course option:selected').val(), 'group': $('#group option:selected').val()}, function(json_schedule){
				removeCells(); // Удаляем ячейки
				createTimeTable();
				outputSchedule(json_schedule.schedule, json_schedule.current_week);
			});
			$('.type_timetable').html($('#course option:selected').text()+', '+$('#group option:selected').text());
		}
		else hideTimeTable();
	});
	// Преподаватель -> Выбор преподавателя [Вывод расписания]
	$('#teacher').change(function(){
		if ($('#teacher option:selected').val() != '0') {
			//$.getJSON('getdata.php', {'data': 'schedule', 'type': 'Teacher', 'id': $('#teacher option:selected').val()}, function(json_schedule){
            $.getJSON('http://schedule.local:3000/schedule/byTeacher/' + $('#teacher option:selected').val(), function(json_schedule){
				removeCells(); // Удаляем ячейки
				createTimeTable(json_schedule.schedule);
				outputSchedule(json_schedule.schedule, json_schedule.current_week);
			});
			$('.type_timetable').html($('#teacher option:selected').text());
		}
		else hideTimeTable();
	});
	// Аудитория -> Выбор аудитории [Вывод расписания]
	$('#auditory').change(function(){
		if ($('#auditory option:selected').val() != '0') {
			$.getJSON('getdata.php', {'data': 'schedule', 'type': 'Classroom', 'id': $('#auditory option:selected').val()}, function(json_schedule){
				removeCells(); // Удаляем ячейки
				createTimeTable();
				outputSchedule(json_schedule.schedule, json_schedule.current_week);
			});
			$('.type_timetable').html('Аудитория '+$('#auditory option:selected').text());
		}
		else hideTimeTable();
	});
	// Курс -> Выбор курса
	$('#course').change(function(){
		if (($('#course option:selected').val() != '0') && ($('#type option:selected').val() == 'course')) {
			$("#day").removeAttr("disabled");
			$("#day [value='0']").attr("selected", "selected");
		}
		else {
			$("#day").attr("disabled", "disabled");
			$("#day [value='0']").attr("selected", "selected");
		}
		
		if ($('#timetable_wrapper').css('display') == 'block')
			hideTimeTable();
	});
	// Курс -> Выбор курса -> Выбор дня [Вывод расписания]
	$('#day').change(function(){
		if ($('#day option:selected').val() != '0') {
			$.getJSON('getdata.php', {'data': 'schedule', 'type': 'Course', 'course': $('#course option:selected').val(), 'day': $('#day option:selected').val()}, function(json_schedule){
				removeCells(); // Удаляем ячейки
				createTimeTableCourse2(json_schedule.schedule);
				outputSchedule(json_schedule.schedule, json_schedule.current_week);
			});
			$('.type_timetable').html('Курс '+$('#course option:selected').text());
			
			showTimeTable();
		} else hideTimeTable();
	});
	
	$(window).resize(function(){
		optimizationTimeTable();
	});

    $(document).ready(function(){
        createTimeTable();
    });
    $('.week_now').text('Сейчас верхняя неделя'); // ToDo: Получение данных у backend'а
});