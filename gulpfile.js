'use strict';

//=========================
//  Модули
//=========================

// Основные модули gulp
var gulp = require('gulp');
var lazypipe = require('lazypipe');
var through = require('through');
var empty = function() {
    return through(function(data) {
        this.emit('data', data);
    }, function() {
        this.emit('end');
    });
};
var changed  = require('gulp-changed');

// Модули для css
var lessCss = require('gulp-less');
var prefixerCss = require('gulp-autoprefixer');
var minifyCss = require('gulp-minify-css');

// Модули для js
var minifyJs = require('gulp-uglify');
var beautifyJs = require('gulp-jsbeautifier');


//=========================
//  Настройки
//=========================

// Получение настроек
var opts = (function() {
    var minimist = require('minimist');
    var argv = minimist(process.argv.slice(2));

    return {
        minify: argv.release,
        incremental: !argv.force,
        beautify: argv.beauty || argv.rainbow
    };
})();

var DIR_SRC = 'media';
var DIR_DST = 'site/static';

// Настройки для типов файлов
var types = {};
types.css = {
    ext: {
        src: '.css',
        dst: '.css'
    },
    path: {
        src: DIR_SRC + '/**/*.css',
        dst: DIR_DST
    },
    pipe: lazypipe()
        .pipe(prefixerCss, 'last 2 versions', '> 1%', 'ie9')
        .pipe(opts.minify ? minifyCss : empty)
};
types.less = {
    ext: {
        src: '.less',
        dst: '.css'
    },
    path: {
        src: DIR_SRC + '/**/*.less',
        dst: DIR_DST
    },
    pipe: lazypipe()
        .pipe(lessCss)
        .pipe(types.css.pipe)
};
types.js = {
    ext: {
        src: '.js',
        dst: '.js'
    },
    path: {
        src: DIR_SRC + '/**/*.js',
        dst: DIR_DST
    },
    pipe: lazypipe()
        .pipe(opts.minify ? minifyJs : empty)
        .pipe(opts.beautify ? beautifyJs : empty)
};
types.etc = {
    ext: {
        src: null,
        dst: null
    },
    path: {
        src: (function() {
            var list = [DIR_SRC + '/**/*'];
            Object.keys(types).forEach(function(type) {
                list.push('!' + types[type].path.src);
            });
            return list;
        })(),
        dst: DIR_DST
    },
    pipe: empty
};


//=========================
//  Работа с потоками
//=========================

// Выполнить поток
var executePipe = function(type) {
    var errorHandler = function(e) {
        process.stdout.write(e.message + '\n');
    };

    var pipeChanged = lazypipe()
        .pipe(changed, types[type].path.dst, {
            extension: types[type].ext.dst
        });

    gulp.src(types[type].path.src)
        .pipe(opts.incremental ? pipeChanged() : empty())
        .pipe(types[type].pipe()).on('error', errorHandler)
        .pipe(gulp.dest(types[type].path.dst));
};


//=========================
//  Задачи
//=========================

// Подзадачи
gulp.task('css', function() {
    executePipe('css');
});

gulp.task('less', function() {
    executePipe('less');
});

gulp.task('js', function() {
    executePipe('js');
});

gulp.task('etc', function() {
    executePipe('etc');
});

// Задачи
gulp.task('default', ['css', 'less', 'js', 'etc']);

gulp.task('watch', function() {
    gulp.watch(types.css.path.src, ['css']);
    gulp.watch(types.less.path.src, ['less']);
    gulp.watch(types.js.path.src, ['js']);
    gulp.watch(types.etc.path.src, ['etc']);
});
