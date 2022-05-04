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
  },
  image: {
    src: 'assets/images/**',
    dest: 'dest/images',
    dist: 'dist/images'
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

// 图片压缩
const imagemin = require('gulp-imagemin')
function image (path) {
  path = path ? path : paths.image.dest
  console.log(path)
  return function imageMin() {
    return src(paths.image.src)
    .pipe(imagemin())
    .pipe(dest(path))
  }
}

// 雪碧图
// const spritesmith = require('gulp.spritesmith')
// function sprite () {
//   return gulp.src(paths.image.src)
//     .pipe(spritesmith({
//       imgName: 'sprite.png',
//       cssName: 'sprite.css'
//     })).pipe(gulp.dest(paths.image.dest))
// }

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
    series(cleanDest, pugToHtml, javascript, style, image(), reload)
  )
}

exports.default = watchStyle
exports.build = series(cleanDist, parallel(pugToHtmlMin, javascriptMin, styleMin, image(paths.image.dist)))