module.exports = {
  staticFileGlobs: [
    './*.css',
    './*.png',
    './*.JPG',
    './*.avi',  
    './*.swf',
    './assets/**/*.*',
    './*.html',
  './jquery.min.js',
  './dist/js/bootstrap.min.js',
  './assets/js/ie10-viewport-bug-workaround.js',
  './softscroll.js'
  ],
  stripPrefix: '',
  runtimeCaching: [{
    urlPattern: /this\\.is\\.a\\.regex/,
    handler: 'networkFirst'
  }]
};