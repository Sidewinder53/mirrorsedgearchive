const { src, dest, series, parallel, watch } = require('gulp');
const concat = require('gulp-concat');
const minify = require('gulp-minify');
const cleanCss = require('gulp-clean-css');
const purgecss = require('gulp-purgecss');
const rev = require('gulp-rev');
const del = require('del');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const git = require('git-rev-sync')
const imagemin = require('gulp-imagemin');
const mozjpeg = require('imagemin-mozjpeg');
const pngquant = require('imagemin-pngquant');
const svgo = require('imagemin-svgo');
const webp = require('imagemin-webp');
const nunjucks = require('gulp-nunjucks-render');
const flatten = require('gulp-flatten');
const tap = require('gulp-tap');
const cache = require('gulp-cache');
const browserSync = require('browser-sync').create();

const production = false;
const watchHTML = () => watch('./src/**/*.html', series(processTemplate, reload));
const watchCSS = () => watch('./src/**/*.css', series(packBundleCSS, packVendorCSS, packLocalCSS, processTemplate, reload));
const watchJS = () => watch('./src/**/*.js', series(packVendorJS, packBundleJS, packLocalJS, processTemplate, reload));
const watchImg = () => watch(['./src/**/*.jpg', './src/**/*.png'], series(optimizeImg, optimizeImgToWebp, processTemplate, reload));


function serve(done) {
  browserSync.init({
    server: {
      baseDir: "./dist/"
    },
    ui: false,
    online: false,
    open: false
  });
  done();
};

function reload(done) {
  browserSync.reload();
  done();
}

function prepare() {
  return del('./dist/');
}

function cleanup() {
  return cache.clearAll();
}

function processTemplate() {
  delete require.cache[require.resolve('./dist/assets/rev-manifest.json')]
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
        manifest: bundleManifest,
        git: {
          long: git.long(),
          short: git.short(),
          production: false
        }
      }
    }))
    .pipe(replace('{{stamp_title}}', 'Build ID: ' + git.short()))
    .pipe(replace('{{stamp_text}}', 'DEV'))
    .pipe(dest('./dist/'));
}

function packBundleJS() {
  return src([
    './node_modules/jquery/dist/jquery.js',
    './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
    './node_modules/js-cookie/src/js.cookie.js',
    './src/assets/js/cookie-consent.js'
  ])
    .pipe(concat('./dist/assets/vendor/bundles/baseBundle.js'))
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
    .pipe(rev.manifest('./dist/assets/rev-manifest.json', {
      merge: true
    }))
    .pipe(dest('./'));
}

function packLocalJS() {
  return src([
    './src/assets/js/*.js',
    '!./src/assets/js/global.js'
  ], { base: 'src' })
    .pipe(minify({
      noSource: true,
      ext: {
        min: '.js'
      }
    }))
    .pipe(rev())
    .pipe(dest('./dist'))
    .pipe(rev.manifest('./dist/assets/rev-manifest.json', {
      merge: true,
    }))
    .pipe(dest('./'));
}

function packVendorJS() {
  return src([
    './node_modules/img-slider/distr/imgslider.min.js',
    './node_modules/image-picker/image-picker/image-picker.js',
    './node_modules/shaka-player/dist/shaka-player.compiled.js'
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
    .pipe(rev.manifest('./dist/assets/rev-manifest.json', {
      merge: true
    }))
    .pipe(dest('./'))
}

function packBundleCSS() {
  delete require.cache[require.resolve('./dist/assets/rev-manifest.json')]
  var bundleManifest = require('./dist/assets/rev-manifest.json');

  return src([
    './node_modules/bootstrap/dist/css/bootstrap.min.css',
    './src/assets/css/global.css'
  ], { base: '/' })
    .pipe(concat('./dist/assets/vendor/bundles/baseBundle.css'))
    .pipe(nunjucks({
      data: {
        manifest: bundleManifest,
        git: {
          long: git.long(),
          short: git.short(),
          production: false
        }
      },
      ext: '.css'
    }))
    // PurgeCSS has been disabled as it causes a whole bunch of problems and requires a humongous whitelist to work with 3rd-party frameworks
    // .pipe(purgecss({
    //   content: ['./src/**/*.html', './src/**/*.js'],
    //   whitelist: [
    //     '.carousel-item-next',
    //     'carousel-item-prev',
    //     'carousel-item.active',
    //     'close',
    //     'alert-secondary',
    //     'fade',
    //     'show',
    //     'alert-dismissible']
    // }))
    .pipe(cleanCss())
    .pipe(rev())
    .pipe(dest('./'))
    .pipe(tap(function (file) {
      file.base = file.base + '\\dist'
    }))
    .pipe(rev.manifest('./dist/assets/rev-manifest.json', {
      merge: true
    }))
    .pipe(dest('./'));
}

function packLocalCSS() {
  return src([
    './src/assets/css/*.css',
    '!./src/assets/css/global.css'
  ], { base: 'src' })
    .pipe(cleanCss())
    .pipe(rev())
    .pipe(dest('./dist/'))
    .pipe(rev.manifest('./dist/assets/rev-manifest.json', {
      merge: true,
    }))
    .pipe(dest('./'));
}

function packVendorCSS() {
  return src([
    './node_modules/img-slider/distr/imgslider.min.css',
    './node_modules/image-picker/image-picker/image-picker.css',
    './node_modules/@mdi/font/css/materialdesignicons.min.css'
  ], { base: 'node_modules' })
    .pipe(flatten({ includeParents: 1 }))
    .pipe(cleanCss())
    .pipe(rev())
    .pipe(dest('./dist/assets/vendor/'))
    .pipe(tap(function (file) {
      file.base = file.base.substring(0, file.base.length - 14);
    }))
    .pipe(rev.manifest('./dist/assets/rev-manifest.json', {
      merge: true
    }))
    .pipe(dest('./'))
}

function optimizeImg() {
  return src([
    './src/assets/media/image/**/*.jpg',
    './src/assets/media/image/**/*.png',
    './src/assets/media/image/**/*.svg'
  ], { base: 'src' })
    .pipe(cache(imagemin([
      pngquant({ quality: [0.4, 0.6] }),
      mozjpeg({ quality: 70 }),
      svgo()
    ],
      {
        verbose: true
      })),
      {
        name: "jpgpng"
      }
    )
    .pipe(rev())
    .pipe(dest('./dist'))
    .pipe(rev.manifest('./dist/assets/rev-manifest.json', {
      merge: true
    }))
    .pipe(dest('./'));
}

function optimizeImgToWebp() {
  return src([
    './src/assets/media/image/**/*.jpg',
    './src/assets/media/image/**/*.png'
  ], { base: 'src' })
    .pipe(cache(imagemin(
      [webp()],
      {
        verbose: true
      }
    ),
      {
        name: "webp"
      }
    ))
    .pipe(rename({ extname: '.webp' }))
    .pipe(rev())
    .pipe(dest('./dist'))
    .pipe(rev.manifest('./dist/assets/rev-manifest.json', {
      merge: true
    }))
    .pipe(dest('./'));
}

function copyFonts() {
  return src('./node_modules/@mdi/font/fonts/*')
    .pipe(dest('./dist/assets/vendor/fonts/'))
}

function copyStaticAssets() {
  return src([
    'src/**/*.json'
  ])
    .pipe(dest('dist/'))
}

function copyAV() {
  return src(['./src/assets/media/audio/**/*', './src/assets/media/video/**/*'], {
    base: 'src'
  })
    .pipe(rev())
    .pipe(dest('./dist'))
    .pipe(rev.manifest('./dist/assets/rev-manifest.json', {
      merge: true
    }))
    .pipe(dest('./'));
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
    optimizeImg,
    optimizeImgToWebp
  ),
  processTemplate
);

exports.default = series(prepare, copyAndPack);
exports.build = series(prepare, copyAndPack);
exports.buildQuick = series(prepare);
exports.buildProd = series(prepare, cleanup, copyAndPack)
exports.devServer = series(prepare, copyAndPack, serve, parallel(watchHTML, watchCSS, watchJS, watchImg));
exports.prepare = prepare;
exports.cleanup = cleanup;
