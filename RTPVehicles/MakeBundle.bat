call rimraf ./bundle
call tsc
call jspm update
call jspm  bundle-sfx t2.js .\bundle\bundle.js

pause
