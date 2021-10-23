document.addEventListener('DOMContentLoaded', function() {
	let b = document.querySelector('body'),
		previews = document.querySelectorAll('.preview'),
		photosGallery = document.querySelector('.photos__gallery'),
		flagOpenGallery = false,
		photosMoreBtn = document.querySelector('.photos__more'),
		footerMoreBtn = document.querySelectorAll('.footer__more');

	// Копирование блоков изображений в блоке превью:
	for (const preview of previews) {
		if (!preview.classList.contains('discount')) {
			let previewTarget = preview.querySelector('.preview__group'),
				clonePreviewBox = preview.querySelector('.preview__box').cloneNode(true);

			clonePreviewBox.classList.add('preview__box--mobile');
			previewTarget.insertAdjacentElement("afterend", clonePreviewBox);
		};
	};

	// Настройка слайдера для секции типов устройств:
	$('.types__list').slick({
		nextArrow: '.types__arrow--next',
		prevArrow: '.types__arrow--prev',
		responsive: [
			{
				breakpoint: 840,
				settings: {
					slidesToShow: 2
				}
			},
			{
				breakpoint: 576,
				settings: {
					slidesToShow: 1
				}
			},
		],
		slidesToShow: 3,
	});

	// Настройка слайдера для секции отзывов:
	$('.reviews__list').slick({
		nextArrow: '.reviews__arrow--next',
		prevArrow: '.reviews__arrow--prev',
		responsive: [
			{
				breakpoint: 840,
				settings: {
					slidesToShow: 2
				}
			},
			{
				breakpoint: 576,
				settings: {
					slidesToShow: 1
				}
			},
		],
		slidesToShow: 4,
		variableWidth: true
	});

	// Показ остальных фотографий в галерее:
	photosMoreBtn.addEventListener('click', function() {
		let totalHeight = (photosGallery.scrollHeight*100)/b.offsetWidth;

		if (!flagOpenGallery) {
			photosGallery.style.maxHeight = `${totalHeight}vw`;
			flagOpenGallery = true;
			photosMoreBtn.textContent = 'Свернуть';

		}	else {
			photosGallery.style.maxHeight = '';
			flagOpenGallery = false;
			photosMoreBtn.textContent = 'Смотреть еще';
		};
	});

	// Настройка слайдера видео из ютуба:
	$('.in-youtube__slider').slick({
		nextArrow: '.in-youtube__arrow--next',
		prevArrow: '.in-youtube__arrow--prev',
		centerMode: true,
		centerPadding: '10%',
	});

	// Открытие всего списка мест в городе, в подвале сайта:
	for (const footerMore of footerMoreBtn) {
		footerMore.addEventListener('click', function() {
			footerMore.parentElement.parentElement.classList.toggle('is-active');
		});
	};
});


var wow = new WOW({
    mobile: false,
});
wow.init();