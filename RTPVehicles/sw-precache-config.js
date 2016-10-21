module.exports = {
  staticFileGlobs: [
    './*.css',
    './service-worker.js',
    './service-worker-registration.js',
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