var gulp = require('gulp');
var browsersync = require('browser-sync');
var $ = require('gulp-load-plugins')({lazy: true});
const babelify = require("babelify");
const browserify = require("browserify");
var source = require('vinyl-source-stream');
const tsify = require("tsify");

gulp.task('build-css', function(){
    log('Building CSS...');
    return gulp.src('./scss/styles.scss')
        .pipe($.sass().on('error', $.sass.logError))
        .pipe($.autoprefixer())
        .pipe(gulp.dest('./public/css'));
});

gulp.task('build-js', function () {
    return browserify({entries: './js/scripts.ts', debug: true})
        .transform(babelify, {
            presets: ["env"]
        })
        .on("error", (error) => {
            console.log(error);
        })
        .plugin(tsify)
        .on("error", (error) => {
            console.log(error);
        })
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./public/js'));
});

gulp.task('browsersync', function(){
    startBrowserSync();
});


gulp.task("watch", function(){
    gulp.watch("./js/**/*.ts", ["build-js"]);
    // gulp.watch("./public/js/*.js", ["build-js"]);
    gulp.watch("./scss/**/*.scss", ["build-css"]);
});

gulp.task('default', ['watch', 'browsersync']);

// UTILITY FUNCITONS
function log(msg){
    if (typeof(msg) === 'object'){
        for(var item in msg){
            if(msg.hasOwnProperty(item)){
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.blue(msg));
    }
}

function startBrowserSync(){
    if(browsersync.active){
        return;
    }
    log("Syncing browsers...");

    var options = {
        proxy: 'localhost:5775',
        port: 4775,
        files: ['./public/css/styles.css', "./public/js/bundle.js", "!.gitignore"],
        ghostMode: {
            click: true,
            scroll: true,
            location: false,
            forms: true
        },
        injectChanges: true,
        logFileChanges: true,
        logLevel: 'debug',
        logPrefix: 'gulp-patterns',
        notify: true,
        reloadDelay: 1000
    };

    browsersync(options);
}