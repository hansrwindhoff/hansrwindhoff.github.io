call rimraf ./bundle
call tsc
call jspm update
call jspm  bundle-sfx t2 .\bundle\bundle.js

pause
