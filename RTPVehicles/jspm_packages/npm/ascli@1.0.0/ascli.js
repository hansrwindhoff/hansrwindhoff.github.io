/* */ 
(function(process) {
  var util = require("util"),
      path = require("path"),
      colour = require("colour");
  var alphabet = require(path.join(__dirname, "alphabet", "straight.json"));
  module.exports = function(appName) {
    ascli.appName = appName;
    return ascli;
  };
  module.exports.app = module.exports;
  function ascli(title, appendix) {
    title = title || ascli.appName;
    appendix = appendix || "";
    var lines = ["", "", ""],
        c,
        a,
        j,
        ac = "";
    for (var i = 0; i < title.length; i++) {
      c = title.charAt(i);
      if (c == '\x1B') {
        while ((c = title.charAt(i)) != 'm') {
          ac += c;
          i++;
        }
        ac += c;
      } else if ((a = alphabet[c]) || (a = alphabet[c.toLowerCase()]))
        for (j = 0; j < 3; j++)
          lines[j] += ac + a[j];
    }
    for (i = 0; i < lines.length; i++)
      lines[i] = lines[i] + "\x1B[0m";
    lines[1] += " " + appendix;
    if (lines[lines.length - 1].strip.trim().length == 0) {
      lines.pop();
    }
    return '\n' + lines.join('\n') + '\n';
  }
  function indent1() {
    this.write(" " + util.format.apply(null, arguments).replace(/\n/g, "\n ") + "\n");
  }
  ascli.log = indent1.bind(process.stdout);
  ascli.info = indent1.bind(process.stdout);
  ascli.warn = indent1.bind(process.stderr);
  ascli.error = indent1.bind(process.stderr);
  ascli.appName = "app";
  ascli.banner = function(title, appendix) {
    console.log(ascli(title, appendix));
    return ascli;
  };
  ascli.use = function(alpha) {
    if (typeof alpha === 'string')
      alphabet = require(alpha);
    else
      alphabet = alpha;
    return ascli;
  };
  ascli.ok = function(msg, code) {
    process.stderr.write('\n ' + ascli.appName.green.bold + ' OK'.white.bold + (msg ? ' ' + msg : '') + '\n');
    if (typeof code !== 'undefined')
      process.exit(code);
  };
  ascli.fail = function(msg, code) {
    process.stderr.write('\n ' + ascli.appName.red.bold + ' ERROR'.white.bold + (msg ? ' ' + msg : '') + '\n');
    if (typeof code !== 'undefined')
      process.exit(code);
  };
  ascli.optjs = require("optjs");
  var opt = ascli.optjs();
  ascli.node = opt.node;
  ascli.script = opt.script;
  ascli.argv = opt.argv;
  ascli.opt = opt.opt;
  ascli.colour = ascli.colors = colour;
})(require("process"));
