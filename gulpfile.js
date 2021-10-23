// Зависимости:
const {src, dest, parallel, series, watch} = require('gulp'),
	autoprefixer = require('gulp-autoprefixer'),
	bssi = require('browsersync-ssi'),
	browserSync = require('browser-sync').create(),
	cleancss = require('gulp-clean-css'),
	del = require('del'),
	rename = require('gulp-rename'),
	rsync = require('gulp-rsync'),
	sass = require('gulp-sass'),
	sassglob = require('gulp-sass-glob'),
	ssi = require('ssi'),
	webpack = require('webpack-stream');

// Рабочие проекты:
const workingProjects = [
	'abc',
	'abc',
	'abc',
	'armor',
	'abc'
];

// Настройки проекта:
let folderProject = workingProjects[3], // Название папки проекта.
	pathApp = `projects/${folderProject}/app/`, // Путь до папки проекта.
	pathComponents = `${pathApp}assets/`, // Путь до папки с компонентами проекта.
	pathPublic = `projects/${folderProject}/public/`, // Путь до папки с готовым проектом.
	listFiles = 'html, htm, txt, json, md, php', // Список расширений, для отслеживания и их.
	mainFileExtension = '.html'; // Расширение главного файла.


// Определяем логику работы Browsersync:
function browsersync() {
	browserSync.init({
		server: {
			baseDir: pathApp,
			middleware: bssi({ baseDir: pathApp, ext: mainFileExtension })
		},
		ghostMode: { clicks: false },
		notify: false,
		online: true,
		// tunnel: nameProject, // Attempt to use the URL https://nameproject.loca.lt
	});
};

// Работа со скриптами:
function scripts() {
	return src([
			`${pathComponents}libs/app.js`,
			`!${pathComponents}libs/*.min.js`,
			`!${pathComponents}libs/*.nf.js`,
			`!${pathComponents}libs/*.dis.js`
		])
		.pipe(webpack({
			mode: 'production',
			performance: { hints: false },
			module: {
				rules: [
					{
						test: /\.(js)$/,
						exclude: /(node_modules)/,
						loader: 'babel-loader',
						query: {
							presets: ['@babel/env'],
							plugins: ['babel-plugin-root-import']
						}
					}
				]
			}
		})).on('error', function handleError() {
			this.emit('end')
		})
		.pipe(rename('app.min.js'))
		.pipe(dest(`${pathComponents}libs/`))
		.pipe(browserSync.stream())
};

// Работа со стилями:
function styles() {
	return src([
			`${pathApp}sass/*.*`,
			`!${pathApp}sass/_*.*`
		])
		.pipe(eval(sassglob)())
		.pipe(eval(sass)())
		.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
		.pipe(cleancss( { level: { 1: { specialComments: 0 } }/* , format: 'beautify' */ } ))
		.pipe(rename({ suffix: ".min" }))
		.pipe(dest(`${pathComponents}css`))
		.pipe(browserSync.stream())
};

// Сборка проекта:
function buildCopy() {
	return src([
		`${pathComponents}css/**/*.min.css`,
		`${pathComponents}fonts/**/*`,
		`!${pathComponents}fonts/*.ttf`,
		`${pathComponents}img/**/*`,
		`${pathComponents}libs/**/*.min.js`,
		`${pathComponents}libs/**/*.nf.js`,
		`${pathApp}**/*${mainFileExtension}`,
		], { base: pathApp })
	.pipe(dest(pathPublic))
};

// Сборка основного файла из частей:
async function buildMainFile() {
	let includes = new ssi(pathApp, pathPublic, `/**/*${mainFileExtension}`);

	includes.compile()
	del(`${pathPublic}content`, { force: true })
};

// Очистка папки с готовым проектом:
function cleanPublic() {
	return del([`${pathPublic}**/*`, `!${pathPublic}.git`, `!${pathPublic}.gitignore`, `!${pathPublic}README.md`], { force: true })
};

// Загрузка проекта на хостинг:
function deploy() {
	return src(pathPublic)
		.pipe(rsync({
			root: pathPublic,
			hostname: 'username@yousite.com',
			destination: 'yousite/public_html/',
			// clean: true, // Mirror copy with file deletion
			include: [/* '*.htaccess' */], // Included files to deploy,
			exclude: [ '**/Thumbs.db', '**/*.DS_Store', `${pathPublic}.git`, `${pathPublic}.gitignore`, `${pathPublic}README.md`],
			recursive: true,
			archive: true,
			silent: false,
			compress: true
	}))
};

// Наблюдение за изменениями файлов:
function startWatch() {
	watch(`${pathApp}sass/**/*`, { usePolling: true }, styles)
	watch([`${pathComponents}libs/**/*.js`, `!${pathComponents}libs/**/*.min.js`], { usePolling: true }, scripts)
	watch(`${pathApp}**/*.{${listFiles}}`, { usePolling: true }).on('change', browserSync.reload)
};


// Экспортируем функции, как таск для Gulp:
exports.browsersync = browsersync
exports.scripts = scripts
exports.styles = styles
exports.deploy = deploy

exports.build = series(cleanPublic, scripts, styles, buildCopy, buildMainFile)
exports.default = series(scripts, styles, parallel(browsersync, startWatch))