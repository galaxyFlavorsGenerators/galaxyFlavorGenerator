var gulp = require('gulp');
var concat = require('gulp-concat');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var inline = require('gulp-inline');
var del = require('del');

gulp.task('default', ['babel', 'concat', 'uglify', 'clean', 'one-file']);

gulp.task('babel', function () {
  return gulp.src('src/app.jsx')
    .pipe(babel())
    .pipe(gulp.dest('tmp'));
});

gulp.task('concat', ['babel'], function () {
  return gulp.src(['tmp/app.js', 'src/functions.js'])
    .pipe(concat('main.js'))
    .pipe(gulp.dest('js'));
});

gulp.task('uglify', ['concat'], function () {
  return gulp.src('./js/main.js')
    .pipe(uglify())
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(gulp.dest('js'));
});

gulp.task('clean', ['uglify'], function () {
  del(['tmp'])
});

gulp.task('one-file', function () {
  gulp.src('index.html')
    .pipe(inline({
      base: './'
    }))
    .pipe(rename('one-file.html'))
    .pipe(gulp.dest('./'));
});