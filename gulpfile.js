const gulp = require('gulp'),
  del = require('del'),
  uglify = require('gulp-uglify-es').default,
  cleanCSS = require('gulp-clean-css'),
  pump = require('pump'),
  imagemin = require('gulp-imagemin'),
  webp = require('gulp-webp'),
  browserSync = require('browser-sync').create(),
  gulpsync = require('gulp-sync')(gulp),
  git = require('git-rev-sync'),
  replace = require('gulp-replace'),
  cache = require('gulp-cached');

gulp.task('default', ['browser-sync']);

const libs = {
  javascript: {
    "jQuery": "<script src=\"https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js\" integrity=\"sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=\" crossorigin=\"anonymous\"></script>",
    "bootstrap-bundle": "<script src=\"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.3.1/js/bootstrap.bundle.min.js\" integrity=\"sha256-fzFFyH01cBVPYzl16KT40wqjhgPtq6FFUB6ckN2+GGw=\" crossorigin=\"anonymous\"></script>",
    "cookies": "<script src=\"https://cdnjs.cloudflare.com/ajax/libs/js-cookie/2.2.0/js.cookie.min.js\" integrity=\"sha384-ujpAYcyxFaJsZN5668lLgOpEH8vtWrbOq8fvj+WZ2kD71LJwGa/9QP/suPPF1hTI\" crossorigin=\"anonymous\"></script>",
    "image-picker": "<script src=\"https://cdnjs.cloudflare.com/ajax/libs/image-picker/0.3.1/image-picker.min.js\" integrity=\"sha256-P13mkADbtcK0GtB1ZJQUEkvYmdA1Vr8C1qgIreybN1U=\" crossorigin=\"anonymous\"></script>",
    "noUiSlider": "<script src=\"https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/12.1.0/nouislider.min.js\" integrity=\"sha256-V76+FCDgnqVqafUQ74coiR7qA3Gd6ZlVuFgdwcGCGlc=\" crossorigin=\"anonymous\"></script>",
    "wNumb": "<script src=\"https://cdnjs.cloudflare.com/ajax/libs/wnumb/1.1.0/wNumb.min.js\" integrity=\"sha256-HT7c4lBipI1Hkl/uvUrU1HQx4WF3oQnSafPjgR9Cn8A=\" crossorigin=\"anonymous\"></script>",
    "polyfill": "<script src=\"https://polyfill.io/v3/polyfill.min.js?flags=gated&rum=true&features=default\" crossorigin=\"anonymous\"></script>",
    "shakaPlayer": "<script src=\"https://cdnjs.cloudflare.com/ajax/libs/shaka-player/2.5.0-beta3/shaka-player.compiled.js\" integrity=\"sha256-6m9r3bvghyaaVlFC924WK0+EdI3ktvIta86PCV3eam8=\" crossorigin=\"anonymous\"></script>"
  },
  css: {
    "bootstrap": "<link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.3.1/css/bootstrap.min.css\" integrity=\"sha256-YLGeXaapI0/5IgZopewRJcFXomhRMlYYjugPLSyNjTY=\" crossorigin=\"anonymous\" />",
    "image-picker": "<link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/image-picker/0.3.1/image-picker.min.css\" integrity=\"sha256-8b3s+ez6wXPJKBWlHOEW2aXyB1eYluL1V3wqh+vHpis=\" crossorigin=\"anonymous\" />",
    "noUiSlider": "<link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/12.1.0/nouislider.min.css\" integrity=\"sha256-MyPOSprr9/vRwXTYc0saw86ylzGM2HVRKWUfHIFta74=\" crossorigin=\"anonymous\" />",
    "MaterialDesign-Webfont": "<link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/MaterialDesign-Webfont/3.5.95/css/materialdesignicons.min.css\" integrity=\"sha256-gaCvS3Gc1xMFmZIK3NtGwbruVVajvayTTME6yrHanTA=\" crossorigin=\"anonymous\" />"
  }
};

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
    gulp.watch('dev/**/*.js', ['watch-js']);
    gulp.watch('dev/**/*.css', ['watch-css']);
    gulp.watch('dev/**/*.html', ['watch-html']);
    gulp.watch('dev/**/*.json', ['copy']);
  }
);

gulp.task('watch-js', ['build-js'], function(cb) {
  browserSync.reload();
  cb();
});

gulp.task('watch-css', ['build-css'], function(cb) {
  browserSync.reload();
  cb();
});

gulp.task('watch-html', ['build-html'], function(cb) {
  browserSync.reload();
  cb();
});

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
  'build-sandbox',
  gulpsync.sync([
    'cleanup',
    ['build-js', 'build-css', 'build-html-sandbox'],
    ['optimize', 'optimizeWEBP'],
    'copy'
  ])
);

gulp.task('cleanup', function(cb) {
  return del('dist');
});

gulp.task('build-js', function(cb) {
  pump(
    [
      gulp.src('dev/assets/js/*.js'),
      uglify({ ecma: 6 }),
      gulp.dest('dist/assets/js')
    ],
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
      
      replace('<!-- {{lib-js:jQuery}} -->', libs.javascript["jQuery"]),
      replace('<!-- {{lib-js:shakaPlayer}} -->', libs.javascript["shakaPlayer"]),
      replace('<!-- {{lib-js:bootstrap-bundle}} -->', libs.javascript["bootstrap-bundle"]),
      replace('<!-- {{lib-js:image-picker}} -->', libs.javascript["image-picker"]),
      replace('<!-- {{lib-js:noUiSlider}} -->', libs.javascript["noUiSlider"]),
      replace('<!-- {{lib-js:wNumb}} -->', libs.javascript["wNumb"]),
      replace('<!-- {{lib-js:cookies}} -->', libs.javascript["cookies"]),

      replace('<!-- {{lib-css:bootstrap}} -->', libs.css["bootstrap"]),
      replace('<!-- {{lib-css:image-picker}} -->', libs.css["image-picker"]),
      replace('<!-- {{lib-css:noUiSlider}} -->', libs.css["noUiSlider"]),
      replace('<!-- {{lib-css:MaterialDesign-Webfont}} -->', libs.css["MaterialDesign-Webfont"]),
      replace('<!-- {{lib-css:bootstrap}} -->', libs.css["bootstrap"]),

      gulp.dest('dist')
    ],
    cb
  );
});

gulp.task('build-html-prod', function(cb) {
  pump(
    [
      gulp.src('dev/**/*.html'),
      replace(
        '<!-- {{CERT}} -->',
        '&nbsp;&#8729;&nbsp;<a href="https://github.com/Sidewinder53/mirrorsedgearchive/commit/' +
          git.long() +
          '" id="cert" class="text-secondary">Build: ' +
          git.short() +
          '</a>'
      ),
      replace('{{stamp_title}}', 'Build ID: ' + git.short()),
      replace('{{stamp_text}}', 'DEV'),
      
      replace('<!-- {{lib-js:jQuery}} -->', libs.javascript["jQuery"]),
      replace('<!-- {{lib-js:bootstrap-bundle}} -->', libs.javascript["bootstrap-bundle"]),
      replace('<!-- {{lib-js:image-picker}} -->', libs.javascript["image-picker"]),
      replace('<!-- {{lib-js:noUiSlider}} -->', libs.javascript["noUiSlider"]),
      replace('<!-- {{lib-js:wNumb}} -->', libs.javascript["wNumb"]),
      replace('<!-- {{lib-js:cookies}} -->', libs.javascript["cookies"]),

      replace('<!-- {{lib-css:bootstrap}} -->', libs.css["bootstrap"]),
      replace('<!-- {{lib-css:image-picker}} -->', libs.css["image-picker"]),
      replace('<!-- {{lib-css:noUiSlider}} -->', libs.css["noUiSlider"]),
      replace('<!-- {{lib-css:MaterialDesign-Webfont}} -->', libs.css["MaterialDesign-Webfont"]),
      replace('<!-- {{lib-css:bootstrap}} -->', libs.css["bootstrap"]),

      gulp.dest('dist'),
    ],
    cb
  );
});

gulp.task('build-html-sandbox', function(cb) {
  pump(
    [
      gulp.src('dev/**/*.html'),
      replace('<!-- {{STAMP}} -->', '<span id="beta-stamp">DEV</span>'),
      replace(
        '<!-- {{CERT}} -->',
        '&nbsp;&#8729;&nbsp;<a href="https://github.com/Sidewinder53/mirrorsedgearchive/commit/' +
          git.long() +
          '" id="cert" class="text-secondary">Build: ' +
          git.short() +
          '</a>'
      ),

      replace('<!-- {{lib-js:jQuery}} -->', libs.javascript["jQuery"]),
      replace('<!-- {{lib-js:bootstrap-bundle}} -->', libs.javascript["bootstrap-bundle"]),
      replace('<!-- {{lib-js:image-picker}} -->', libs.javascript["image-picker"]),
      replace('<!-- {{lib-js:noUiSlider}} -->', libs.javascript["noUiSlider"]),
      replace('<!-- {{lib-js:wNumb}} -->', libs.javascript["wNumb"]),
      replace('<!-- {{lib-js:cookies}} -->', libs.javascript["cookies"]),

      replace('<!-- {{lib-css:bootstrap}} -->', libs.css["bootstrap"]),
      replace('<!-- {{lib-css:image-picker}} -->', libs.css["image-picker"]),
      replace('<!-- {{lib-css:noUiSlider}} -->', libs.css["noUiSlider"]),
      replace('<!-- {{lib-css:MaterialDesign-Webfont}} -->', libs.css["MaterialDesign-Webfont"]),
      replace('<!-- {{lib-css:bootstrap}} -->', libs.css["bootstrap"]),

      gulp.dest('dist'),
    ],
    cb
  );
});

gulp.task('optimize', function(cb) {
  pump(
    [
      gulp.src([
        'dev/assets/media/image/**/*',
        '!dev/assets/media/image/development_vs_release/**/*',
        '!dev/assets/media/image/map/**/*',
        '!dev/assets/media/image/credits/**/*'
      ]),
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
      gulp.src([
        'dev/assets/media/image/**/*',
        '!dev/assets/media/image/development_vs_release/**/*',
        '!dev/assets/media/image/map/**/*',
        '!dev/assets/media/image/credits/**/*'
      ]),
      cache('webpImageCache'),
      webp({ verbose: true }),
      gulp.dest('dist/assets/media/image')
    ],
    cb
  );
});

gulp.task('copy', function() {
  return (
    gulp
      .src([
        'dev/**/*',
        '!dev/assets/js/*.js',
        '!dev/assets/css/*.css',
        '!templates/**/*',
        '!dev/**/*.html',
        '!dev/assets/media/image/development_vs_release/**/*',
        '!dev/assets/media/image/map/**/*',
        '!dev/assets/media/image/credits/**/*'
      ])
      .pipe(gulp.dest('dist')),
    gulp
      .src('dev/assets/media/image/development_vs_release/**/*')
      .pipe(gulp.dest('dist/assets/media/image/development_vs_release/')),
    gulp
      .src('dev/assets/media/image/map/**/*')
      .pipe(gulp.dest('dist/assets/media/image/map/')),
    gulp
      .src('dev/assets/media/image/credits/**/*')
      .pipe(gulp.dest('dist/assets/media/image/credits'))
  );
});
