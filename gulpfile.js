const { src, dest, series, parallel, watch } = require('gulp');
const concat = require('gulp-concat');
const minify = require('gulp-minify');
const cleanCss = require('gulp-clean-css');
const rev = require('gulp-rev');
const del = require('del');
const replace = require('gulp-replace');
const liveServer = require('live-server');
// const nunjucksRender = require('gulp-nunjucks-render');

function devServer() {
  liveServer.start({ root: './dist' })
  watch('./dev/*', function () {
    series(cleanup, parallel(packJS, packCSS, copyFonts))
  });
}

function cleanup() {
  return del('dist');
}

function insertBundle() {
  var bundleManifest = require('./dist/assets/rev-manifest.json');
  return src('./index.html')
    .pipe(replace('<!-- {{baseBundleJS}} -->', '<script src="/assets/js/' + bundleManifest['baseBundle.js'] + '"></script>'))
    .pipe(replace('<!-- {{baseBundleCSS}} -->', '<link rel="stylesheet" type="text/css" href="/assets/css/' + bundleManifest['baseBundle.css'] + '">'))
    .pipe(dest('./dist/'))
}

function packJS() {
  return src([
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
    'node_modules/js-cookie/src/js.cookie.js'
  ])
    .pipe(concat('baseBundle.js'))
    .pipe(minify())
    .pipe(rev())
    .pipe(dest('dist/assets/js'))
    .pipe(rev.manifest('dist/assets/rev-manifest.json', {
      merge: true
    }))
    .pipe(dest('./')),
    src([
      'dev/assets/js/*.js',
    ])
      .pipe(minify())
      .pipe(dest('dist/assets/js'));;
}

function packCSS() {
  return src([
    'node_modules/bootstrap/dist/css/bootstrap.min.css',
    'node_modules/@mdi/font/css/materialdesignicons.min.css',
    'dev/assets/css/global.css'
  ])
    .pipe(concat('baseBundle.css'))
    .pipe(cleanCss())
    .pipe(rev())
    .pipe(dest('dist/assets/css'))
    .pipe(rev.manifest('dist/assets/rev-manifest.json', {
      merge: true
    }))
    .pipe(dest('./')),
    src([
      'dev/assets/css/*.css',
      '!dev/assets/css/global.css'
    ])
      .pipe(cleanCss())
      .pipe(dest('dist/assets/css'));
}

function copyFonts() {
  return src('node_modules/@mdi/font/fonts/*')
    .pipe(dest('dist/assets/fonts'))
}

exports.default = series(cleanup, parallel(packJS, packCSS, copyFonts), insertBundle);
exports.build = series(cleanup, parallel(packJS, packCSS, copyFonts), insertBundle);
exports.devServer = series(series(cleanup, parallel(packJS, packCSS, copyFonts), insertBundle), devServer);
