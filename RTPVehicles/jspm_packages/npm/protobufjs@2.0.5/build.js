/* */ 
var Preprocessor = require("preprocessor"),
    fs = require("fs");
var pkg = require(__dirname + "/package.json");
var source = new Preprocessor(fs.readFileSync(__dirname + "/src/ProtoBuf.js"), __dirname + "/src").process({
  "NOPARSE": false,
  "VERSION": pkg.version
});
console.log("Writing ProtoBuf.js: " + source.length + " bytes");
fs.writeFileSync(__dirname + "/ProtoBuf.js", source);
source = new Preprocessor(fs.readFileSync(__dirname + "/src/ProtoBuf.js"), __dirname + "/src").process({
  "NOPARSE": true,
  "VERSION": pkg.version
});
console.log("Writing ProtoBuf.noparse.js: " + source.length + " bytes");
fs.writeFileSync(__dirname + "/ProtoBuf.noparse.js", source);
source = new Preprocessor(fs.readFileSync(__dirname + "/src/bower.json"), __dirname + "/src").process({"VERSION": pkg.version});
console.log("Writing bower.json: " + source.length + " bytes");
fs.writeFileSync(__dirname + "/bower.json", source);
