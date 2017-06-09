var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var fs = require('fs');
var path = require('path');
var runSequence = require('run-sequence');
var del = require('del');
var async = require('async');
var fse = require('fs-extra');
var expandTilde = require('expand-tilde');

var release = require('gulp-github-release');
var zip = require('gulp-zip');

var minimist = require('minimist');


//used to get dynamically generated menus from extensions
import * as pluginDefinition from './src/plugin'


var knownOptions = {
  string: 'target',
  default: { target: 'production' }
};

var options = minimist(process.argv.slice(2), knownOptions);

console.log("Gulp is setup for target: " + options.target);

var SKETCH_PLUGINS_FOLDER = path.join(expandTilde('~'),'/Library/Application Support/com.bohemiancoding.sketch3/Plugins');

var ManifestProcessorOptions = {
    pluginManifestDescriberName: 'HKSketchFusionExtension',
    startingManifestTag: '__$begin_of_manifest_\n',
    endingManifestTag: '__$end_of_manifest_\n',
    scriptFileName: 'plugin.js',
    globalVarName: '__globals'
};

var currentManifest = {};


gulp.task('evaluatePluginDefinition', function () {

  console.log('EVALUATING PLUGIN DEFINITION');

  var pluginDefinitionSource = fs.readFileSync(path.join(__dirname,'src', ManifestProcessorOptions.scriptFileName),'utf8')

  fs.writeFileSync(path.join(__dirname,'src', 'pluginSource.js'), pluginDefinitionSource, 'utf8')

  console.log(pluginDefinitionSource);

  //create extension menus string
  var extensionMenusJSString = ''
  pluginDefinition.extensionMenus.forEach((extensionMenu) => {
    extensionMenusJSString += `{title:'${extensionMenu.title}', items:[${extensionMenu.items.map((item) => "'" + item +  "'").join(',')}]},`
  })

  //create extension commands string
  var extensionCommandsJSString = ''
  Object.keys(pluginDefinition.extensionCommands).forEach((extensionCommandId) => {
    var command = pluginDefinition.extensionCommands[extensionCommandId]
    extensionCommandsJSString += `${extensionCommandId}: {name: '${command.name}', shortcut: '${command.shortcut}', run: commands.${extensionCommandId}},`
  })

  var newPluginDefinitionSource = pluginDefinitionSource.replace("'EXT_MENUS',", extensionMenusJSString).replace("'EXT_COMMANDS': null", extensionCommandsJSString)

  fs.writeFileSync(path.join(__dirname,'src', 'plugin.js'), newPluginDefinitionSource, 'utf8')
});


gulp.task('restorePluginSource', function () {

  var pluginDefinitionSource = fs.readFileSync(path.join(__dirname,'src', 'pluginSource.js'),'utf8')

  fs.writeFileSync(path.join(__dirname,'src', 'plugin.js'), pluginDefinitionSource, 'utf8')
});


function extractManifestObject() {

    var data = fs.readFileSync(path.join(__dirname,'build',ManifestProcessorOptions.scriptFileName),'utf8');
    var startTag = ManifestProcessorOptions.startingManifestTag;
    var endTag = ManifestProcessorOptions.endingManifestTag;

    var startIndex = data.indexOf(startTag);
    var endIndex = data.indexOf(endTag);

    if(startIndex === -1 || endIndex === -1) {
        return;
    }

    return JSON.parse(data.substring(startIndex+startTag.length,endIndex));
}

gulp.task('clean', function () {
    return del(['build/**','dist/**', 'src/evaluatedPlugin.js']);
});

gulp.task('prepare-manifest',function(callback) {

    var manifest = extractManifestObject();

    // manipulate manifest for sketch
    if (options.target === 'beta') {
      manifest.version = manifest.version + '-beta';
      manifest.identifier = manifest.identifier + '-beta';
      manifest.bundleName = manifest.bundleName + manifest.version;
      manifest.name = manifest.name + ' (' + manifest.version + ')';
    }

    fse.outputJsonSync(path.join(__dirname,'build/manifest.json'),manifest);
    currentManifest = manifest;
    callback(null);
});

gulp.task('prepare-folders',function(callback) {
    async.parallel({
        build: function(callback) {
            fse.ensureDir(path.join(__dirname,'build'),callback);
        },
        dist: function(callback) {
            fse.ensureDir(path.join(__dirname,'dist'),callback);
        }
    },callback);
});


gulp.task('assemble-plugin-bundle',function(callback) {

    function normalizePluginFileName(name) {
        return name;
    }

    //TODO fix next line

    var bundlePath = path.join(__dirname,'dist',normalizePluginFileName(currentManifest.bundleName || currentManifest.name) + '.sketchplugin');

    async.parallel({
        manifest: function(callback) {
            fse.outputJson(path.join(bundlePath,'Contents','Sketch','manifest.json'),currentManifest,callback);
        },
        runtime: function(callback) {
            var script = fs.readFileSync(path.join(__dirname,'build',ManifestProcessorOptions.scriptFileName),'utf8');
            script = ["var "+ManifestProcessorOptions.globalVarName+" = this;",script].join("");

            fse.outputFile(path.join(bundlePath,'Contents','Sketch',ManifestProcessorOptions.scriptFileName),script,callback);
        }
    },function(err,data) {
        callback(null);
    });
});

gulp.task('assemble-plugin-resources',function(callback) {
    function normalizePluginFileName(name) {
        return name;
    }

    return gulp.src('src/resources/**/*.*')
        .pipe(gulp.dest(path.join(__dirname,'dist',normalizePluginFileName(currentManifest.bundleName || currentManifest.name)+'.sketchplugin','Contents/Resources')));
});

gulp.task('install-plugin',function(){
    return gulp.src("dist/**/*.*")
        .pipe(gulp.dest(SKETCH_PLUGINS_FOLDER));
});

gulp.task('build',function(callback) {
    runSequence('clean','prepare-folders', 'evaluatePluginDefinition', 'bundle','prepare-manifest','assemble-plugin-bundle','assemble-plugin-resources', 'restorePluginSource', 'install-plugin',callback);
});

gulp.task('bundle',function() {
    var filePath = './src/plugin.js';
    var extensions = ['.js'];

    var bundler = browserify({
        entries: [filePath],
        extensions: extensions,
        debug: false
    });

    bundler.transform(babelify.configure({
        presets: ["es2015"],
        plugins: [["babel-plugin-sketch-manifest-processor",ManifestProcessorOptions]]
    }));

    return bundler.bundle()
        .pipe(source('plugin.js'))
        .pipe(gulp.dest('./build/'));
});


gulp.task('watch', function(){
    runSequence('build', function() {
        gulp.watch('./src/**/*.*',function() {
            console.log("Watching...");
            runSequence('clean','build',function(){
                console.log("Rebuild complete!");
            });
        });
    });
});

gulp.task('default',function(callback) {
    runSequence('build', callback);
});

gulp.task('zip', ['build'], function() {
  return gulp.src('./dist/*.sketchplugin/**/*')
    .pipe(zip('OpenColor-SketchPlugin.zip'))
    .pipe(gulp.dest('dist'))
});

gulp.task('release', ['zip'], function() {
  return gulp.src('./dist/OpenColor-SketchPlugin.zip')
    .pipe(release({
      //token: 'token',                     // or you can set an env var called GITHUB_TOKEN instead
      owner: 'opencolor-tools',                    // if missing, it will be extracted from manifest (the repository.url field)
      repo: 'sketch-opencolor',            // if missing, it will be extracted from manifest (the repository.url field)
      //tag: 'v1.0.0',                      // if missing, the version will be extracted from manifest and prepended by a 'v'
      //name: 'publish-release v1.0.0',     // if missing, it will be the same as the tag
      //notes: 'very good!',                // if missing it will be left undefined
      draft: false,                       // if missing it's false
      prerelease: true,                  // if missing it's false
      manifest: require('./build/manifest.json') // package.json from which default values will be extracted if they're missing
    }));
});
