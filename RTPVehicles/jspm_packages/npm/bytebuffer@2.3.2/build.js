/* */ 
var Preprocessor = require('preprocessor'),
    fs = require('fs'),
    pkg = require(__dirname + "/package.json");
var pp = new Preprocessor(fs.readFileSync(__dirname + "/src/ByteBuffer.js"), __dirname + "/src");
fs.writeFileSync(__dirname + "/ByteBuffer.js", pp.process({"VERSION": pkg.version}));
pp = new Preprocessor(fs.readFileSync(__dirname + "/src/bower.json"), __dirname + "/src");
fs.writeFileSync(__dirname + "/bower.json", pp.process({"VERSION": pkg.version}));
