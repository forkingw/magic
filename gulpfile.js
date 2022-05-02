const { src, dest, watch, parallel, series } = require('gulp')
// 样式
const sass = require('gulp-sass')(require('sass'))
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')
const rename = require('gulp-rename')

// 浏览器
const browserSync = require('browser-sync').create()
const reload = browserSync.reload

// 路径
const paths = {
  styles: {
    src: 'assets/scss/**/*.scss',
    dest: 'dest/css',
    dist: 'dist/css'
  },
  javascript: {
    src: 'assets/js/**/*.js',
    dest: 'dest/js',
    dist: 'dist/js'
  },
  html: {
    src: 'assets/**/*.pug',
    dest: 'dest',
    dist: 'dist'
  }
}

// scss
function style() {
  return src(paths.styles.src)
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(dest(paths.styles.dest))
    .pipe(browserSync.stream())
}

function styleMin() {
  return src(paths.styles.src, { sourcemaps: true })
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(rename({
      extname: '.min.css'
    }))
    .pipe(dest(paths.styles.dist, { sourcemaps: '.' }))
}

// javascript
const swc = require('gulp-swc');
const swcOption = {
  jsc: {
    target: "es5"
  }
}
function javascript() {
  return src(paths.javascript.src)
    .pipe(swc(swcOption))
    .pipe(dest(paths.javascript.dest))
    .pipe(browserSync.stream())
}
function javascriptMin() {
  const miniSwcOption = Object({ minify: true}, swcOption)
  return src(paths.javascript.src, { sourcemaps: true })
    .pipe(swc(miniSwcOption))
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(dest(paths.javascript.dist, { sourcemaps: '.' }))
}

// pug
const pug = require('gulp-pug')
function pugToHtml() {
  return src(paths.html.src)
    .pipe(pug({
      pretty: true
    }))
    .pipe(dest(paths.html.dest))
    .pipe(browserSync.stream())
}
function pugToHtmlMin() {
  return src(paths.html.src)
    .pipe(pug())
    .pipe(dest(paths.html.dist))
}

// clean
const del = require('del')
function cleanDest(cb) {
  return del([paths.html.dest, paths.javascript.dest, paths.styles.dest], cb)
}
function cleanDist(cb) {
  return del([paths.html.dist, paths.javascript.dist, paths.styles.dist], cb)
  // return del('dist', cb)
}

function watchStyle() {
  browserSync.init({
    server: {
      baseDir: 'dest'
    }
  })
  watch(
    [paths.styles.src, paths.javascript.src],
    { events: ['all', 'ready'] },
    series(cleanDest, pugToHtml, javascript, style, reload)
  )
}

exports.default = watchStyle
exports.build = series(cleanDist, parallel(pugToHtmlMin, javascriptMin, styleMin))