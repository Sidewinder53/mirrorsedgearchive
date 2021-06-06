// Global Imports

const { src, dest, series, parallel, watch } = require('gulp');
const fs = require('fs');

// Gulp tools
const del = require('del');
const tap = require('gulp-tap');
const rev = require('gulp-rev');
const git = require('git-rev-sync')
const cache = require('gulp-cache');
const concat = require('gulp-concat');
const minify = require('gulp-minify');
const jsonminify = require('gulp-jsonminify');
const rename = require('gulp-rename');
const flatten = require('gulp-flatten');
const replace = require('gulp-replace');
const cleanCss = require('gulp-clean-css');
const nunjucks = require('gulp-nunjucks-render');

// Image optimization
const imagemin = require('gulp-imagemin');
const svgo = require('imagemin-svgo');
const webp = require('imagemin-webp');
const mozjpeg = require('imagemin-mozjpeg');
const pngquant = require('imagemin-pngquant');
const browserSync = require('browser-sync').create();

// BrowserSync instance creation
function serve(done) {
  var browserSyncConfig = {
    server: {
      baseDir: "./dist/"
    },
    ui: false,
    online: false,
    open: false,
    notify: false
  }
  if (fs.existsSync('./.vscode/browsersync-local.json')) {
    console.log('Detected local Browsersync configuration.')
    browserSyncConfig = JSON.parse(fs.readFileSync('./.vscode/browsersync-local.json'));
  }
  browserSync.init(browserSyncConfig);
  done();
};

// DevServer asset watchdogs
const watchHTML = () => watch('./src/**/*.html', series(processTemplateDev, reload));
const watchCSS = () => watch('./src/**/*.css', series(packBundleCSS, packVendorCSS, packLocalCSS, processTemplateDev, reload));
const watchJS = () => watch('./src/**/*.js', series(packVendorJS, packBundleJS, packLocalJS, processTemplateDev, reload));
const watchImg = () => watch(['./src/**/*.jpg', './src/**/*.png'], series(optimizeImg, optimizeImgToWebp, processTemplateDev, reload));

function reload(done) {
  browserSync.reload();
  done();
}

function prepare() {
  return del('./dist/');
}

function cleanCache() {
  return cache.clearAll();
}

function processTemplateDev() {
  delete require.cache[require.resolve('./dist/assets/rev-manifest.json')]
  var bundleManifest = require('./dist/assets/rev-manifest.json');

  return src([
    './src/index.html',
    './src/out/index.html',
    './src/development_vs_release/index.html',
    './src/project_billboard/index.html',
    './src/project_propaganda/index.html',
    './src/project_doomsday/index.html',
    './src/project_graffiti/index.html',
    './src/archive/index.html',
    './src/contribute/index.html',
    './src/credits/index.html',
    './src/legal/*.html'
  ], {
    base: './src/'
  })
    .pipe(nunjucks({
      data: {
        manifest: bundleManifest,
        git: {
          long: git.long(),
          short: git.short(),
          branch: git.branch(),
          production: false
        }
      }
    }))
    .pipe(replace('{{stamp_title}}', 'Build ID: ' + git.short()))
    .pipe(replace('{{stamp_text}}', 'DEV'))
    .pipe(dest('./dist/'));
}

function processTemplateProd() {
  delete require.cache[require.resolve('./dist/assets/rev-manifest.json')]
  var bundleManifest = require('./dist/assets/rev-manifest.json');

  return src([
    './src/index.html',
    './src/out/index.html',
    './src/development_vs_release/index.html',
    './src/project_billboard/index.html',
    './src/project_propaganda/index.html',
    './src/project_doomsday/index.html',
    './src/project_graffiti/index.html',
    './src/archive/index.html',
    './src/contribute/index.html',
    './src/credits/index.html',
    './src/legal/*.html'
  ], {
    base: './src/'
  })
    .pipe(nunjucks({
      data: {
        manifest: bundleManifest,
        git: {
          long: git.long(),
          short: git.short(),
          branch: git.branch(),
          production: true
        }
      }
    }))
    .pipe(dest('./dist/'));
}

function packBundleJS() {
  return src([
    './node_modules/jquery/dist/jquery.js',
    './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
    './node_modules/js-cookie/src/js.cookie.js',
    './src/assets/js/util.js'
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
  delete require.cache[require.resolve('./dist/assets/rev-manifest.json')]
  var bundleManifest = require('./dist/assets/rev-manifest.json');

  return src([
    './src/assets/js/*.js',
    '!./src/assets/js/global.js'
  ], { base: 'src' })
    .pipe(nunjucks({
      data: {
        manifest: bundleManifest,
        git: {
          long: git.long(),
          short: git.short(),
          production: false
        }
      },
      ext: '.js'
    }))
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
    './node_modules/comparison-slider/dist/comparison-slider.min.js',
    './node_modules/pagemap/dist/pagemap.min.js',
    './node_modules/image-picker/image-picker/image-picker.min.js',
    './node_modules/nouislider/distribute/nouislider.min.js',
    './node_modules/shaka-player/dist/shaka-player.compiled.js',
    './node_modules/wnumb/wNumb.min.js'
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

function copyVendorDependencies() {
  return src([
    './node_modules/wasm-imagemagick/dist/magick.wasm',
    './node_modules/wasm-imagemagick/dist/magickApi.js',
    './node_modules/wasm-imagemagick/dist/magick.js',
  ], { base: 'node_modules' })
    .pipe(flatten({ includeParents: 1 }))
    .pipe(dest('./dist/assets/vendor/'))
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
    // Install gulp-purgecss to re-enable CSS purging
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
    './node_modules/image-picker/image-picker/image-picker.css',
    './node_modules/@mdi/font/css/materialdesignicons.min.css',
    './node_modules/nouislider/distribute/nouislider.min.css'
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
      pngquant({ quality: [0.65, 0.85] }),
      mozjpeg({ quality: 85 }),
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
      [webp({quality: 90, alphaQuality: 100})],
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

function copyStatic() {
  return src([
    'src/favicon.ico',
    'src/icon-192.png',
    'src/icon-512.png',
    'src/icon.svg',
    'src/apple-touch-icon.png',
    'src/manifest.webmanifest',
    'src/.well-known/*'
  ], { base: 'src' })
    .pipe(dest('dist/'));
}

function copyJson() {
  return src([
    'src/**/*.json'
  ], { base: 'src' })
    .pipe(jsonminify())
    .pipe(dest('dist/'));
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

// Task groups
// CopyAndPack is the main task, which calls all relevant sub-tasks to pack, optimize and copy resources.
// ProcessTemplate[dev/prod] is called externally, to determine the build environment.

const copyAssets = series(
  copyJson,
  copyStatic,
  copyFonts,
  copyAV,
);

const optimizeAssets = series(
  optimizeImg,
  optimizeImgToWebp
);

const packJS = series(
  packVendorJS,
  copyVendorDependencies,
  packBundleJS,
  packLocalJS
);

const packCSS = series(
  packBundleCSS,
  packVendorCSS,
  packLocalCSS,
);

const copyAndPack = series(
  copyAssets,
  optimizeAssets,
  packJS,
  packCSS
);


// Exports

exports.default = series(prepare, copyAndPack);
exports.build = series(prepare, copyAndPack, processTemplateDev);
exports.buildProduction = series(prepare, cleanCache, copyAndPack, processTemplateProd)
exports.devServer = series(prepare, copyAndPack, processTemplateDev, serve, parallel(watchHTML, watchCSS, watchJS, watchImg));
exports.prepare = prepare;
exports.cleanCache = cleanCache;
