rimraf ./bundle
tsc
jspm update
jspm  bundle-sfx t2.js ./bundle/bundle.js

