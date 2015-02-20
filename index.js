'use strict';

var css = require('css');
var fs = require('fs');
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

var PLUGIN_NAME = 'gulp-avoidfoit';

function avoidfoit(cssContent, options) {
  var jsCode = '',
    defaultOptions = {
      className: 'fonts-loaded',
      legacy: true
    },
    fontfaceobserver = '';

  // Manage plugin options
  options = options || defaultOptions;
  options.className = options.className !== "undefined" ? options.className : defaultOptions.className;
  options.legacy = options.legacy !== "undefined" ? options.legacy : defaultOptions.legacy;

  // Get fontfaceobserver.js content
  fontfaceobserver = options.legacy ? 'node_modules/gulp-avoidfoit/node_modules/fontfaceobserver/fontfaceobserver.standalone.js' : 'node_modules/gulp-avoidfoit/node_modules/fontfaceobserver/fontfaceobserver.js';
  jsCode += fs.readFileSync(fontfaceobserver, 'utf8'); // Yep, this is ugly :(

  // Generates the custom js code
  (function () {
    var webFonts = [],
      promiseAll = [];
    jsCode += '(function (w){if( w.document.documentElement.className.indexOf( "' + options.className + '") > -1){return;}';
    // Scan and parse all css to json
    css.parse(cssContent)
      // Filter to get only @font-face rules
      .stylesheet.rules.filter(function (el) {
        return el.type === 'font-face';
      })
      // Generates the FontFaceObserver parameters
      .forEach(function (font, fontIndex) {
        webFonts.push(['', {}]);
        font = font.declarations.forEach(function (theProperty) {
          if (theProperty.property === 'font-family') {
            webFonts[fontIndex][0] = theProperty.value;
          }
          if (theProperty.property === 'font-style' && theProperty.value !== 'normal') {
            webFonts[fontIndex][1].style = theProperty.value;
          }
          if (theProperty.property === 'font-weight' && theProperty.value !== 'normal' && theProperty.value !== '400') {
            webFonts[fontIndex][1].weight = theProperty.value;
          }
        });
      });
    // Generates a FontFaceObserver instace for each webfont
    webFonts.forEach(function (font, fontIndex) {
      promiseAll.push('font' + fontIndex + '.check()');
      jsCode += 'var font' + fontIndex + ' = new w.FontFaceObserver( ' + font[0] + ', ' + JSON.stringify(font[1]) + ');';
    });
    // Add final js code
    jsCode += 'w.Promise.all([' + promiseAll + ']).then(function (){w.document.documentElement.className += " ' + options.className + '";});}(this));';
  }());
  return jsCode;
}

module.exports = function (options) {
  var stream = through.obj(function (file, enc, callback) {
    if (file.isNull()) {
      return callback(null, file);
    }
    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
      return callback(null, file);
    }
    if (file.isBuffer()) {
      file.contents = new Buffer(avoidfoit(String(file.contents), options));
      return callback(null, file);
    }
    this.push(file);
    return callback(null, file);
  });

  return stream;
};