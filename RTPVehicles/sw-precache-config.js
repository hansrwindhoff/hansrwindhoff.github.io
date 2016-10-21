module.exports = {
  staticFileGlobs: [
    './*.css',
    './fa/**/*.*',
    './*.png',
    './*.html',
    './images/**.*',
    './bundle/**.js'
  ],
  stripPrefix: '',
  runtimeCaching: [{
    urlPattern: /this\\.is\\.a\\.regex/,
    handler: 'cacheFirst'
  }]
};