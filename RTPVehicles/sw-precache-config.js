module.exports = {
  staticFileGlobs: [
    './*.css',
    './*.png',
    './*.html',
    './images/**.*',
    './bundle/**.js'
  ],
  stripPrefix: '',
  runtimeCaching: [{
    urlPattern: /this\\.is\\.a\\.regex/,
    handler: 'networkFirst'
  }]
};