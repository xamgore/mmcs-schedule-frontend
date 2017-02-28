'use strict';


//===================================
//  Модули
//===================================

const gulp = require('gulp');
const runSequence = require('run-sequence');
const console = require('console');
const lazypipe = require('lazypipe');
const plumber = require('gulp-plumber');
const filter = require('gulp-filter');
const watch = require('gulp-watch');
const yargs = require('yargs');
const empty = () => require('through')(function (data) { this.emit('data', data); }, function () { this.emit('end'); });
const fs = require('fs-extra');
const path = require('path');
const del = require('del');

// Обработчик ошибок
function errorHandler(error) {
    console.error(error.message);
}

// Создание потока
function createPipe(pipesRaw) {
    if (!pipesRaw || !pipesRaw.length) return empty;

    let result = lazypipe();
    pipesRaw.forEach(pipeRaw => {
        let pipeData = JSON.parse(JSON.stringify(pipeRaw));
        pipeData[0] = require(pipeData[0]);
        result = result.pipe.apply(result, pipeData);
    });
    return result;
}

// Выполнение задачи
function executeGulpTask({ src, dest, pipe, minify }, filePath) {
    return gulp.src(src, { dot: true })
        .pipe(filter(file => !filePath || file.path === filePath))
        .pipe(plumber({ errorHandler }))
        .pipe(pipe())
        .pipe(opts.minify ? minify() : empty())
        .pipe(gulp.dest(dest));
}


//===================================
//  Параметры запуска
//===================================

let opts = {
    minify: yargs.argv.release
};


//===================================
//  Настройки
//===================================

let config = require('./gulp-config');

config.types.etc = { src: [ '**/*' ] };

Object.keys(config.types).forEach(typeName => {
    let type = config.types[typeName];
    type.src = type.src.map(src => path.resolve(config.src, src));
    type.dest = path.resolve(config.dest, type.dest || '');
    type.pipe = createPipe(type.pipe);
    type.minify = createPipe(type.minify);
});

Object.keys(config.types).forEach(typeName => {
    if (typeName === 'etc') return;

    let type = config.types[typeName];
    type.src.forEach(src => config.types.etc.src.push(`!${src}`));
});

config.cleanList = [ `${config.dest}/**`, `!${config.dest}` ];
if (config.cleanIgnore) config.cleanIgnore.forEach(data => config.cleanList.push(`!${path.resolve(config.dest, data)}`));


//===================================
//  Задачи по работе с source
//===================================

// Копирование файлов
Object.keys(config.types).forEach(typeName => {
    let type = config.types[typeName];
    gulp.task(`source_${typeName}`, () => executeGulpTask(type));
});

gulp.task('source_copy', callback => runSequence(
    Object.keys(config.types).map(typeName => `source_${typeName}`),
    callback
));

// Очистка папки сборки
gulp.task('source_clean', callback => del(config.cleanList, callback));

// Генерация source
gulp.task('source', callback => runSequence(
    'source_clean',
    'source_copy',
    callback
));

// Отслеживание изменений
gulp.task('source_watch', callback => {
    Object.keys(config.types).forEach(typeName => {
        let type = config.types[typeName];
        watch(type.src, vinyl => {
            switch (vinyl.event) {
                case 'add':
                case 'change':
                    executeGulpTask(type, vinyl.path).on('end', () => console.log(`File "${path.relative('.', vinyl.path)}": ${vinyl.event} as "${typeName}"`));
                    break;

                case 'unlink':
                    console.log(`Уou must restart gulp to delete file "${path.relative(config.src, vinyl.path)}"`);
                    break;
            }
        });
    });
});


//===================================
//  Основные задачи
//===================================

// Задача по-умолчанию
gulp.task('default', callback => runSequence(
    'source',
    callback
));

// Отслеживание изменений
gulp.task('watch', callback => runSequence(
    'source',
    'source_watch',
    callback
));