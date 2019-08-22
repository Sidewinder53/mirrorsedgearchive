const { src, dest, series, parallel, watch } = require('gulp');
const concat = require('gulp-concat');
const minify = require('gulp-minify');
const cleanCss = require('gulp-clean-css');
const purgecss = require('gulp-purgecss')
const rev = require('gulp-rev');
const del = require('del');
const replace = require('gulp-replace');
const liveServer = require('live-server');
const imagemin = require('gulp-imagemin');
const nunjucks = require('gulp-nunjucks-render');
const flatten = require('gulp-flatten');
const tap = require('gulp-tap');


function devServer() {
  liveServer.start({ root: './dist' })
  watch('./src/**/*', function () {
    return series(cleanup, copyAndPack);
  });
}

function cleanup() {
  return del('dist');
}

function processTemplate() {
  var bundleManifest = require('./dist/assets/rev-manifest.json');
  return src([
    './src/index.html',
    './src/development_vs_release/index.html',
    './src/project_propaganda/index.html'
  ], {
      base: './src/'
    })
    .pipe(nunjucks({
      data: {
        manifest: bundleManifest
      }
    }))
    .pipe(dest('./dist/'))
}

function packBundleJS() {
  return src([
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
    'node_modules/js-cookie/src/js.cookie.js',
    'src/assets/js/cookie-consent.js'
  ])
    .pipe(concat('dist/assets/vendor/bundles/baseBundle.js'))
    .pipe(minify({
      noSource: true,
      ext: {
        min: '.js'
      }
    }))
    .pipe(rev())
    .pipe(dest('./'))
    .pipe(tap(function (file) {
      file.base = file.base + '\\dist'
    }))
    .pipe(rev.manifest('dist/assets/rev-manifest.json', {
      merge: true
    }))
    .pipe(dest('./'));
}

function packLocalJS() {
  return src([
    'src/assets/js/*.js',
    '!src/assets/js/global.js'
  ], { base: 'src' })
    .pipe(minify({
      noSource: true,
      ext: {
        min: '.js'
      }
    }))
    .pipe(rev())
    .pipe(dest('./dist'))
    .pipe(rev.manifest('dist/assets/rev-manifest.json', {
      merge: true,
    }))
    .pipe(dest('./'));
}

function packVendorJS() {
  return src([
    'node_modules/img-slider/distr/imgslider.min.js',
    'node_modules/image-picker/image-picker/image-picker.js',
    'node_modules/shaka-player/dist/shaka-player.compiled.js'
  ], { base: 'node_modules' })
    .pipe(flatten({ includeParents: 1 }))
    .pipe(minify({
      noSource: true,
      ext: {
        min: '.js'
      }
    }))
    .pipe(rev())
    .pipe(dest('./dist/assets/vendor/'))
    .pipe(tap(function (file) {
      file.base = file.base.substring(0, file.base.length - 14);
    }))
    .pipe(rev.manifest('dist/assets/rev-manifest.json', {
      merge: true
    }))
    .pipe(dest('./'))
}

function packBundleCSS() {
  return src([
    'node_modules/bootstrap/dist/css/bootstrap.min.css',
    'src/assets/css/global.css'
  ], { base: '/' })
    .pipe(concat('dist/assets/vendor/bundles/baseBundle.css'))
    .pipe(purgecss({
      content: ['./src/**/*.html', './src/**/*.js'],
      whitelist: ['close', 'alert-secondary', 'fade', 'show', 'alert-dismissible']
    }))
    .pipe(cleanCss())
    .pipe(rev())
    .pipe(dest('./'))
    .pipe(tap(function (file) {
      file.base = file.base + '\\dist'
    }))
    .pipe(rev.manifest('dist/assets/rev-manifest.json', {
      merge: true
    }))
    .pipe(dest('./'));
}

function packLocalCSS() {
  return src([
    'src/assets/css/*.css',
    '!src/assets/css/global.css'
  ], { base: 'src' })
    .pipe(cleanCss())
    .pipe(rev())
    .pipe(dest('./dist/'))
    .pipe(rev.manifest('dist/assets/rev-manifest.json', {
      merge: true,
    }))
    .pipe(dest('./'));
}

function packVendorCSS() {
  return src([
    'node_modules/img-slider/distr/imgslider.min.css',
    'node_modules/image-picker/image-picker/image-picker.css',
    'node_modules/@mdi/font/css/materialdesignicons.min.css'
  ], { base: 'node_modules' })
    .pipe(flatten({ includeParents: 1 }))
    .pipe(cleanCss())
    .pipe(rev())
    .pipe(dest('./dist/assets/vendor/'))
    .pipe(tap(function (file) {
      file.base = file.base.substring(0, file.base.length - 14);
    }))
    .pipe(rev.manifest('dist/assets/rev-manifest.json', {
      merge: true
    }))
    .pipe(dest('./'))
}

function optimizeImg() {
  return src('src/assets/media/image/**/*')
    // Todo set up imagemin
    // .pipe(imagemin())
    .pipe(dest('dist/assets/media/image'));
}

function copyFonts() {
  return src('node_modules/@mdi/font/fonts/*')
    .pipe(dest('dist/assets/vendor/fonts/'))
}

function copyStaticAssets() {
  return src([
    'src/**/*.json'
  ])
    .pipe(dest('dist/'))
}

function copyAV() {
  return src('src/assets/media/audio/**/*').pipe(dest('dist/assets/media/audio')),
    src('src/assets/media/video/**/*').pipe(dest('dist/assets/media/video'));
}

const copyAndPack = series(
  series(
    copyStaticAssets
  ),
  series(
    packVendorJS,
    packBundleJS,
    packLocalJS
  ),
  series(
    packBundleCSS,
    packVendorCSS,
    packLocalCSS,
  ),
  series(
    copyFonts,
    copyAV,
    optimizeImg
  ),
  processTemplate
);

exports.default = series(cleanup, copyAndPack);
exports.build = series(cleanup, copyAndPack);
exports.devServer = series(cleanup, copyAndPack, devServer);
exports.cleanup = cleanup;
