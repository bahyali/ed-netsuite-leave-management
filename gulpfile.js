/**
 * @description Gulp Setup for a NetSuit SuitScript 2.0 development enviroment
 * @created     Fri, 1 March 2019
 * @author      Bahy Ali
 * @for         eDigits
 * @license     opensource
 * @version     alpha
 * 
 * # Netsuit Development Automation Script
 * ---------------------------------------
 * ## Problem:
 * --
 * Due the restriction on imports in SuiteScripts, developers struggled with duplication,
 * long files and all the added "benefits" that comes with non-modular structure.
 * 
 * ## My Solution
 * --
 * Allow developers to work modularly (or however they feel like) and then compile the structure to 
 * SuiteScript friendly files by using Automation.
 * 
 * ## Technologies:
 * --
 * - Gulp       (Automation)
 * - TypeScript 
 * 
 * ## Directory Strcuture:
 * --
 * - src:
 *  - Core: Shared classes of the system (Will be combined and shared with all generated files)
 *    - CoreClass/fileName.js || CoreClass.js
 *  - Pages: Your Pages
 *    - PageName/fileType.js
 * 
 * ## Expected Result:
 * --
 * - build:
 *  - prod: Generated production files with auto-versions, imports concatinated in the files.
 *    - pageName.fileType.js
 */

 // Modules
 const { src, dest, series } = require('gulp');
 const path = require('path');
 const del = require('del')
 const named = require('vinyl-named');
 const webpack = require('webpack-stream');
 
 
 // ## Directory Structure
 // Shared Files.
 const core_src = 'src/Core/*/*.ts';
 // Forms/Contexts/Pages or whatever you call it
 const pages_src = 'src/Records/*/*.ts';
 
 
 // Output directory
 const build_dir = 'build';
 
 function build() {
   // todo Add versioning
 
   return src(pages_src)
     .pipe(named(function(file) {
       // Rename files to "parentDirectory.fileType.js"
       return path.dirname(file.path).split(path.sep).pop() + '.' + file.stem;
     }))
     // Bundle into SuiteScript Friendly Structure
     .pipe(webpack(require('./webpack.config.js')))
     .pipe(dest(build_dir))
 }
 
 // Clean Build Directory
 function clean() {
   return del(build_dir)
 }
 
 exports.build = build;
 exports.default = series(clean, build);