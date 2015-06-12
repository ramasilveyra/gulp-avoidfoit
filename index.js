'use strict';

var css = require('css');
var fs = require('fs');
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

var PLUGIN_NAME = 'gulp-avoidfoit';

/**
 * Merge defaults with user options
 *
 * @private
 * @param {Object} defaults Default settings
 * @param {Object} options User options
 * @returns {Object} Merged values of defaults and options
 */
var extend = function (defaults, options) {
  var extended = {};
  var prop;
  for (prop in defaults) {
    if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
      extended[prop] = defaults[prop];
    }
  }
  for (prop in options) {
    if (Object.prototype.hasOwnProperty.call(options, prop)) {
      extended[prop] = options[prop];
    }
  }
  return extended;
};

function avoidfoit(cssContent, userOptions) {
  var jsCode = '';
  var defaultOptions = {
    className: 'fonts-loaded'
  };

  // Manage plugin options
  var options = extend(defaultOptions, userOptions);

  // Get fontfaceobserver.js content
  jsCode += fs.readFileSync('node_modules/gulp-avoidfoit/node_modules/fontfaceobserver/fontfaceobserver.js', 'utf8'); // Yep, this is ugly :(

  // Generates the custom js code
  (function () {
    var webFonts = [];
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
    jsCode += '!function(e){if(!(e.document.documentElement.className.indexOf("' + options.className + '")>-1)){var n=' + webFonts.length + ',t=function(){n--,n||(e.document.documentElement.className+=" ' + options.className + '")};';
    // Generates a FontFaceObserver instace for each webfont
    webFonts.forEach(function (font, fontIndex) {
      jsCode += 'var font' + fontIndex + '=new e.FontFaceObserver(' + font[0] + ', ' + JSON.stringify(font[1]) + ').check().then(t);';
    });
    // Add final js code
    jsCode += '}}(this);';
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
