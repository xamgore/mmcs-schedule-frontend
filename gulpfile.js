'use strict';


//===================================
//  Модули
//===================================

let gulp = require('gulp');
let runSequence = require('run-sequence');
let console = require('console');
let lazypipe = require('lazypipe');
let plumber = require('gulp-plumber');
let empty = () => require('through')(function (data) { this.emit('data', data); }, function () { this.emit('end'); });
let fs = require('fs-extra');
fs.path = require('path');
fs.delSync = path => require('del').sync(path);

// Обработчик ошибок
let errorHandler = error => console.error(error.message);


//===================================
//  Параметры запуска
//===================================

let argv = require('yargs').argv;
let opts = {
    minify: argv.release
};


//===================================
//  Настройки
//===================================

let config = {
    media: {
        src: "media",
        dest: "www/static",
    },
};

// Настройки для типов файлов
config.media.types = {};
config.media.types.css = {
    path: {
        src: `${config.media.src}/**/*.css`,
        dest: `${config.media.dest}/`
    },
    pipe: lazypipe()
        .pipe(require('gulp-autoprefixer'), 'last 2 versions', '> 1%', 'ie9'),
    minify: require('gulp-cssnano')
};
config.media.types.less = {
    path: {
        src: `${config.media.src}/**/*.less`,
        dest: `${config.media.dest}/`
    },
    pipe: lazypipe()
        .pipe(require('gulp-less'))
        .pipe(config.media.types.css.pipe),
    minify: config.media.types.css.minify
};
config.media.types.js = {
    path: {
        src: `${config.media.src}/**/*.js`,
        dest: `${config.media.dest}`
    },
    pipe: lazypipe()
        .pipe(require('gulp-babel'), { presets: [ 'es2015-without-strict' ] }),
    minify: require('gulp-uglify')
};
config.media.types.etc = {
    path: {
        src: (() => {
            let list = [ `${config.media.src}/**/*` ];
            Object.keys(config.media.types).forEach(typeName => {
                let type = config.media.types[typeName];
                list.push(`!${type.path.src}`)
            });
            return list;
        })(),
        dest: config.media.dest
    }
};


//===================================
//  Задачи по работе с media
//===================================

// Копирование файлов
Object.keys(config.media.types).forEach(typeName => {
    let type = config.media.types[typeName];
    gulp.task(`media_${typeName}`, () => gulp.src(type.path.src)
        .pipe(plumber({ errorHandler }))
        .pipe(type.pipe ? type.pipe() : empty())
        .pipe(opts.minify && type.minify ? type.minify() : empty())
        .pipe(gulp.dest(type.path.dest)));
});

gulp.task('media_copy', callback => runSequence(
    Object.keys(config.media.types).map(typeName => `media_${typeName}`),
    callback
));

// Очистка папки сборки
gulp.task('media_clean', callback => {
    fs.delSync(config.media.dest);
    callback();
});

// Генерация media
gulp.task('media', callback => runSequence(
    'media_clean',
    'media_copy',
    callback
));

// Отслеживание изменений
gulp.task('media_watch', callback => {
    Object.keys(config.media.types).forEach(typeName => {
        let type = config.media.types[typeName];
        gulp.watch(type.path.src, [ `media_${typeName}` ]);
    });
    //callback();
});


//===================================
//  Основные задачи
//===================================

// Задача по-умолчанию
gulp.task('default', callback => runSequence(
    'media',
    callback
));

// Отслеживание изменений
gulp.task('watch', callback => runSequence(
    'media',
    'media_watch',
    callback
));