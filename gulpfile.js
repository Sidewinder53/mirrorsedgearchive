const gulp = require('gulp');

function clean(cb) {

  cb();
}

function build(cb) {

  cb();
}

const build_production = gulp.series()

exports.build_production = build_production;
exports.default = series(clean, build);
