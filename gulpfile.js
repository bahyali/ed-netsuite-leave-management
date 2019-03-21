const gulp = require('gulp');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const ts = require('gulp-typescript');
const imagemin = require('gulp-imagemin');


var distFileName = 'script.js';

// Minify Images
gulp.task('imageMin', () =>
    gulp.src('src/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist'))
);

var tsProject = ts.createProject('tsconfig.json');
gulp.task('default', function () {
    return tsProject.src()
        .pipe(tsProject())
        .js//.pipe(concat(distFileName)) //.pipe(uglify())
        .pipe(gulp.dest('dist'));
});



// // GULP For Head-In-The-Cloud SuiteBundler (To Be Uploaded in NetSuite)
// const gulptools = require('@hitc/netsuite-tools/gulptools');
// gulp.task('build-and-upload', function () {
//     gulptools.setupHITCGulp(gulp);
// });