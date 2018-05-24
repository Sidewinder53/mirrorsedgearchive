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
    ['build-js', 'build-css', 'build-html'],
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
  'build-full',
  gulpsync.sync([
    'cleanup',
    ['build-js', 'build-css', 'build-html'],
    ['optimize', 'optimizeWEBP'],
    'copy'
  ])
);

gulp.task(
  'build-prod',
  gulpsync.sync([
    'cleanup',
    ['build-js', 'build-css', 'build-html-prod'],
    ['optimize', 'optimizeWEBP'],
    'copy'
  ])
);

gulp.task(
  'default',
  gulpsync.sync([
    'cleanup',
    ['build-js', 'build-css', 'build-html'],
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

gulp.task('build-html', function(cb) {
  pump(
    [
      gulp.src('dev/**/*.html'),
      replace('{{stamp_title}}', 'Build ID: ' + git.short()),
      replace('{{stamp_text}}', 'DEV'),
      gulp.dest('dist')
    ],
    cb
  );
});

gulp.task('build-html-prod', function(cb) {
  var url = git.remoteUrl();
  if (!git.isDirty) {
    pump(
      [
        gulp.src('dev/**/*.html'),
        replace('<!-- {{STAMP}} -->', ''),
        replace(
          '<!-- {{CERT}} -->!',
          '<a href="' +
            url.substring(0, url.length - 4).concat('/commit/' + git.long()) +
            '" id="cert">Certified build: ' +
            git.short() +
            '</a>'
        ),
        gulp.dest('dist')
      ],
      cb
    );
  } else {
    pump(
      [
        gulp.src('dev/**/*.html'),
        replace('<!-- {{STAMP}} -->', ''),
        replace(
          '<!-- {{CERT}} -->',
          '&nbsp;&#8729;&nbsp;<a href="' +
            url.substring(0, url.length - 4).concat('/commit/' + git.long()) +
            '" id="cert" class="text-secondary">Uncertified build based on: ' +
            git.short() +
            '</a>'
        ),
        gulp.dest('dist')
      ],
      cb
    );
  }
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
      '!templates/**/*',
      '!dev/**/*.html'
    ])
    .pipe(gulp.dest('dist'));
});
