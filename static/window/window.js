$(function() {

	// Проблемма с отступами сверху

	var iScrolled = 0; // Связанная с окнами
	
	// Открываем окно
	$.fn.open_window = function(title, content) {
		iScrolled = $(window).scrollTop();
		$('.page_body').css('position', 'fixed');
		$('.page_body').css('margin-top', '-'+iScrolled+'px');
		$('.shadow').css('display', 'block');
		$('.window_block').css('display', 'block');
		$('.window').css('display', 'block');
		
		$('.window').html('\
		<div class="header">\
			<div class="header_title">\
				<span>'+title+'</span>\
			</div>\
			<div class="header_exit"><img src="static/window/close.png" id="close" /></div>\
		</div>\
		<div class="content">'+content+'</div>');
	};

	// Закрываем окно
	$.fn.close_window = function(){
		$('.shadow').css('display', 'none');
		$('.window_block').css('display', 'none');
		$('.window').css('display', 'none');
		$('.window').html('');
		
		$('.page_body').css('margin-top', '0px');
		$('.page_body').css('position', 'relative');
		$(window).scrollTop(iScrolled);
	};
	
	// Закрываем окно при нажатие на кнопку 'закрыть' или крестит
	$('.window').on('click', '#close', function() {
        $.fn.close_window();
	});
	// Закрываем окно при нажатие на затемненный фон
	$('.shadow').click( function() {
        $.fn.close_window();
	});
	/*
// Волшебные окошки
	
	// Открыть окно 'О сайте'
	$('.about').click(function() {
		open_window('Немного о проекте','\
			<div class="header"><p>Что это такое?</p></div>\
			<div class="header"><p>Разработчики</p></div>\
		');
	});
	*/
});
