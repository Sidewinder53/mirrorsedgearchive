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
  replace = require('gulp-replace'),
  cache = require('gulp-cached');

gulp.task(
  'default',
  gulpsync.sync([
    'cleanup',
    ['build-js', 'build-css', 'build-html'],
    ['optimize', 'optimizeWEBP'],
    'copy'
  ])
);

gulp.task(
  'browser-sync',
  gulpsync.sync([['build-js', 'build-css', 'build-html'], 'copy']),
  function() {
    browserSync.init({
      notify: false,
      server: {
        baseDir: './dist',
        middleware: function(req, res, next) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          next();
        }
      }
    });
    gulp.watch('dev/**/*', ['browser-sync-reload']);
  }
);

gulp.task(
  'browser-sync-reload',
  gulpsync.sync([['build-js', 'build-css', 'build-html'], 'copy']),
  function(cb) {
    browserSync.reload();
    cb();
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
      cache('htmlcache'),
      replace('{{stamp_title}}', 'Build ID: ' + git.short()),
      replace('{{stamp_text}}', 'DEV'),
      gulp.dest('dist')
    ],
    cb
  );
});

gulp.task('build-html-prod', function(cb) {
  pump(
    [
      gulp.src('dev/**/*.html'),
      replace('<!-- {{STAMP}} -->', '<span id="beta-stamp">BETA</span>'),
      replace(
        '<!-- {{CERT}} -->',
        '&nbsp;&#8729;&nbsp;<a href="https://github.com/Sidewinder53/mirrorsedgearchive/commit/' +
          git.long() +
          '" id="cert" class="text-secondary">Build: ' +
          git.short() +
          '</a>'
      ),
      gulp.dest('dist')
    ],
    cb
  );
});

gulp.task('optimize', function(cb) {
  pump(
    [
      gulp.src('dev/assets/media/image/**/*'),
      cache('genericImageCache'),
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
      cache('webpImageCache'),
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
