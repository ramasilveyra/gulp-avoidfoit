gulp-avoidfoit
============

Scans your css files and generates the JS code to load all the webfonts with Fonts Events to avoid FOIT (Flash of Invisible Text) and to improve performance.
> This plugin is based on [Font Loading Revisited with Font Events](http://www.filamentgroup.com/lab/font-events.html) by [Scott Jehl](http://twitter.com/scottjehl) post on [Filament Group](http://www.filamentgroup.com/). This article is a MUST READ.

## Install and Usage

First, install `gulp-replace` as a development dependency:

```shell
npm install --save-dev gulp-replace
```

Then, add it to your `gulpfile.js`:

```javascript
var avoidfoit = require('gulp-avoidfoit');

gulp.task('js:fonts', function() {
  return gulp.src('./dist/assets/styles/main.css')
    .pipe(avoidfoit())
    .pipe(gulp.dest('./dist/assets/scripts/vendor'));
});
```

## Example

If in your CSS has:

```css
@font-face {
  font-family: 'Roboto';
  font-weight: normal;
  font-style: normal;
  src: ...;
}
@font-face {
  font-family: 'Roboto';
  font-weight: 500;
  font-style: normal;
  src: ...;
}
@font-face {
  font-family: 'Open Sans';
  font-weight: 400;
  font-style: italic;
  src: ...;
}
```

The output of JS code is:

```javascript
/*  Bram Stein’s FontFaceObserver script here */
(function( w ) {
  if( w.document.documentElement.className.indexOf( "fonts-loaded" ) > -1 ) {
    return;
  }

  var font0 = new w.FontFaceObserver( 'Roboto', {});
  var font1 = new w.FontFaceObserver( 'Roboto', {"weight":"500"});
  var font2 = new w.FontFaceObserver( 'Open Sans', {"style":"italic"});

  w.Promise
    .all([font0.check(), font1.check(), font2.check()])
    .then(function() {
      w.document.documentElement.className += " fonts-loaded";
    });
}( this ));
```

## API

### avoidfoit([options])
An optional argument, `options`, can be passed.

#### options
Type: `Object`

##### options.className
Type: `string`  
Default: `fonts-loaded`

The class name to add in the html element when all fonts are loaded.

##### options.legacy
Type: `boolean`  
Default: `true`

Add the fontfaceobserver.standalone.js or fontfaceobserver.js version of polyfill.

## Minor pitfalls
When I have more time I fix this pitfalls
* You have to use ´gulp-rename´ to change the name of file.
* There is a sync line!!