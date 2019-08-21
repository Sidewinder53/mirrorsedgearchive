const { src, dest, series, parallel, watch } = require('gulp');
const concat = require('gulp-concat');
const minify = require('gulp-minify');
const cleanCss = require('gulp-clean-css');
const rev = require('gulp-rev');
const del = require('del');
const replace = require('gulp-replace');
const liveServer = require('live-server');
const imagemin = require('gulp-imagemin');
const nunjucksRender = require('gulp-nunjucks-render');

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
    .pipe(replace('<!-- {{baseBundleJS}} -->', '<script src="/assets/js/' + bundleManifest['baseBundle-min.js'] + '"></script>'))
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

function optimizeImg() {
  return src('dev/assets/media/image/**/*')
  // Todo set up imagemin
  // .pipe(imagemin())
  .pipe(dest('dist/assets/media/image'));
}

function copyFonts() {
  return src('node_modules/@mdi/font/fonts/*')
    .pipe(dest('dist/assets/fonts'))
}

function copyAV() {
  return src('dev/assets/media/audio/**/*').pipe(dest('dist/assets/media/audio')),
    src('dev/assets/media/video/**/*').pipe(dest('dist/assets/media/video'));
}

const copyAndPack = series(
  parallel(
    packJS,
    packCSS,
    copyFonts,
    copyAV,
    optimizeImg
  ),
  insertBundle
);

exports.default = series(cleanup, copyAndPack);
exports.build = series(cleanup, copyAndPack);
exports.devServer = series(cleanup, copyAndPack, devServer);
exports.cleanup = cleanup;
