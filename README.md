gulp-avoidfoit
============

Scans your css files and generates the JS code to load all the webfonts with Fonts Events to avoid FOIT (Flash of Invisible Text) and to improve performance.
> This plugin is based on [Font Loading Revisited with Font Events](http://www.filamentgroup.com/lab/font-events.html) by [Scott Jehl](http://twitter.com/scottjehl) post on [Filament Group](http://www.filamentgroup.com/). This article is a MUST READ.

## Install and Usage

First, install `gulp-avoidfoit` as a development dependency:

```shell
npm install --save-dev gulp-avoidfoit
```

Then, add it to your `gulpfile.js`:

```javascript
var gulp = require('gulp');
var avoidfoit = require('gulp-avoidfoit');
var rename = require('gulp-rename');

gulp.task('js:fonts', function() {
  return gulp.src('./dist/assets/styles/main.css')
    .pipe(avoidfoit())
    .pipe(rename({
      basename: 'typography',
      extname: '.js'
    }))
    .pipe(gulp.dest('./dist/assets/scripts/vendor'));
});
```

## Example

If your CSS has:

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
    var fonts = 3;
    var checkFonts = function() {
      fonts--;
      if (!fonts)  {
        w.document.documentElement.className += " fonts-loaded";
      }
    };
    var font0 = new w.FontFaceObserver( 'Roboto', {}).check().then(checkFonts);
    var font1 = new w.FontFaceObserver( 'Roboto', {"weight":"500"}).check().then(checkFonts);
    var font2 = new w.FontFaceObserver( 'Open Sans', {"style":"italic"}).check().then(checkFonts);
  }
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

## Minor errors

When I have more time I fix this errors:

* You have to use `gulp-rename` to change the name of file.
* There is a sync line!!