var gulp = require('gulp'),
    gutil = require('gulp-util'),
    jshint = require('gulp-jshint'),
    browserify = require('gulp-browserify'),
    concat = require('gulp-concat'),
    clean = require('gulp-clean');

var sass = require('gulp-sass'),
  // Not necessary, but I like this one, it automatically adds prefixes for all browsers
  autoprefixer = require('gulp-autoprefixer');


var embedlr = require('gulp-embedlr'),
    refresh = require('gulp-livereload'),
    lrserver = require('tiny-lr')(),
    express = require('express'),
    livereload = require('connect-livereload'),
    livereloadport = 35729,
    serverport = 3000;




//===========================TASKS=============================
// JSHint task
gulp.task('lint', function() {
  gulp.src('./public/scripts/*.js')
  .pipe(jshint())
  // You can look into pretty reporters as well, but that's another story
  .pipe(jshint.reporter('default'));
});

// Browserify task
gulp.task('browserify', function() {
  // Single point of entry (make sure not to src ALL your files, browserify will figure it out for you)
  gulp.src(['./public/scripts/main.js'])
  .pipe(browserify({
    insertGlobals: true,
    debug: true
  }))
  // Bundle to a single file
  .pipe(concat('bundle.js'))
  // Output it to our dist folder
  .pipe(gulp.dest('dist/js'));
});


// Styles task
gulp.task('styles', function() {
  gulp.src('./public/styles/*.scss')
  // The onerror handler prevents Gulp from crashing when you make a mistake in your SASS
  .pipe(sass({onError: function(e) { console.log(e); } }))
  // Optionally add autoprefixer
  .pipe(autoprefixer("last 2 versions", "> 1%", "ie 8"))
  // These last two should look familiar now :)
  .pipe(gulp.dest('dist/css/'))
  .pipe(refresh(lrserver));
});


// Views task
gulp.task('views', function() {
  // Get our index.html
  gulp.src('./public/index.html')
  // And put it in the dist folder
  .pipe(gulp.dest('dist/'));

  // Any other view files from app/views
  gulp.src('./public/views/**/*')
  // Will be put in the dist/views folder
  .pipe(gulp.dest('dist/views/'))
  // Tell the lrserver to refresh
  .pipe(refresh(lrserver)); 
});



// Dev task
gulp.task('dev', function() {
  // Start webserver
  server.listen(serverport);
  // Start live reload
  lrserver.listen(livereloadport);
  // Run the watch task, to keep taps on changes
  gulp.run('watch');
});




//===========================WATCH=========================
gulp.task('watch', ['lint'], function() {
  // Watch our scripts
  gulp.watch(['./public/scripts/*.js', './public/scripts/**/*.js'],[
    'lint',
    'browserify'
  ]);

  gulp.watch(['./public/index.html', 'app/views/**/*.html'], [
    'views'
  ]);

  gulp.watch(['./public/styles/*.scss', './public/styles/**/*.scss'], [
    'styles'
  ]);

});



// Set up an express server (but not starting it yet)
var server = express();
// Add live reload
server.use(livereload({port: livereloadport}));
// Use our 'dist' folder as rootfolder
server.use(express.static('./dist'));
// Because I like HTML5 pushstate .. this redirects everything back to our index.html
server.all('/*', function(req, res) {
    res.sendfile('index.html', { root: 'dist' });
});
