const gulp = require('gulp'),
  del = require('del'),
  uglify = require('gulp-uglify'),
  cleanCSS = require('gulp-clean-css'),
  pump = require('pump'),
  imagemin = require('gulp-imagemin'),
  webp = require('gulp-webp'),
  browserSync = require('browser-sync').create(),
  gulpsync = require('gulp-sync')(gulp),
  git = require('git-rev-sync'),
  replace = require('gulp-replace');

gulp.task(
  'browser-sync',
  gulpsync.sync([
    'cleanup',
    ['build-js', 'build-css'],
    ['optimize', 'optimizeWEBP'],
    'copy'
  ]),
  function() {
    browserSync.init({
      notify: false,
      server: {
        baseDir: './dist'
      }
    });
    gulp.watch('dist/**/*').on('change', browserSync.reload);
  }
);

gulp.task(
  'default',
  gulpsync.sync([
    'cleanup',
    ['build-js', 'build-css'],
    ['optimize', 'optimizeWEBP'],
    'copy'
  ])
);

gulp.task('cleanup', function(cb) {
  return del('dist');
});

gulp.task('build-js', function(cb) {
  pump(
    [gulp.src('dev/assets/js/*.js'), uglify(), gulp.dest('dist/assets/js')],
    cb
  );
});

gulp.task('build-css', function(cb) {
  pump(
    [
      gulp.src('dev/assets/css/*.css'),
      cleanCSS(),
      gulp.dest('dist/assets/css')
    ],
    cb
  );
});

gulp.task('optimize', function(cb) {
  pump(
    [
      gulp.src('dev/assets/media/image/**/*'),
      imagemin({ verbose: true }),
      gulp.dest('dist/assets/media/image')
    ],
    cb
  );
});

gulp.task('optimizeWEBP', function(cb) {
  pump(
    [
      gulp.src('dev/assets/media/image/**/*'),
      webp({ verbose: true }),
      gulp.dest('dist/assets/media/image')
    ],
    cb
  );
});

gulp.task('copy', function() {
  return gulp
    .src([
      'dev/**/*',
      '!dev/assets/js/*',
      '!dev/assets/css/*',
      '!templates/**/*'
    ])
    .pipe(
      replace('Bugs, features, ideas? Hit us up!', 'Build ID: ' + git.short())
    )
    .pipe(gulp.dest('dist'));
});
