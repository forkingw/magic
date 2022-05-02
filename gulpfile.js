const { src, dest, watch, parallel, series } = require('gulp')
const sass = require('gulp-sass')(require('sass'))
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')
const rename = require('gulp-rename')
const browserSync = require('browser-sync').create()
browserSync.init({
  server: {
    baseDir: 'dest'
  }
})

const paths = {
  styles: {
    src: 'assets/scss/**/*.scss',
    dest: 'dest',
    dist: 'dist'
  }
}

function livereload () {
  browserSync.reload({
    stream: true
  })
}

function style () {
  return src(paths.styles.src, { sourcemaps: true })
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(dest(paths.styles.dest, { sourcemaps: '.' }))
}

function styleMin () {
  return src(paths.styles.src, { sourcemaps: true })
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(rename({
      extname: '.min.css'
    }))
    .pipe(dest(paths.styles.dist, { sourcemaps: '.' }))
}

function watchStyle () {
  watch(paths.styles.src, series(style, livereload))
}

exports.default = watchStyle
exports.build = styleMin