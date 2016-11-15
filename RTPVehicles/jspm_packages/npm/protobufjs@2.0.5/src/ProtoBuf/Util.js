/* */ 
(function(process) {
  ProtoBuf.Util = (function() {
    "use strict";
    if (!Object.create) {
      Object.create = function(o) {
        if (arguments.length > 1) {
          throw new Error('Object.create implementation only accepts the first parameter.');
        }
        function F() {}
        F.prototype = o;
        return new F();
      };
    }
    var Util = {};
    Util.IS_NODE = (typeof window === 'undefined' || !window.window) && typeof require === 'function' && typeof process !== 'undefined' && typeof process["nextTick"] === 'function';
    Util.XHR = function() {
      var XMLHttpFactories = [function() {
        return new XMLHttpRequest();
      }, function() {
        return new ActiveXObject("Msxml2.XMLHTTP");
      }, function() {
        return new ActiveXObject("Msxml3.XMLHTTP");
      }, function() {
        return new ActiveXObject("Microsoft.XMLHTTP");
      }];
      var xhr = null;
      for (var i = 0; i < XMLHttpFactories.length; i++) {
        try {
          xhr = XMLHttpFactories[i]();
        } catch (e) {
          continue;
        }
        break;
      }
      if (!xhr)
        throw (new Error("XMLHttpRequest is not supported"));
      return xhr;
    };
    Util.fetch = function(path, callback) {
      if (callback && typeof callback != 'function')
        callback = null;
      if (Util.IS_NODE) {
        if (callback) {
          require("fs").readFile(path, function(err, data) {
            if (err) {
              callback(null);
            } else
              callback("" + data);
          });
        } else {
          try {
            return require("fs").readFileSync(path);
          } catch (e) {
            return null;
          }
        }
      } else {
        var xhr = Util.XHR();
        xhr.open('GET', path, callback ? true : false);
        xhr.setRequestHeader('Accept', 'text/plain');
        if (typeof xhr.overrideMimeType === 'function')
          xhr.overrideMimeType('text/plain');
        if (callback) {
          xhr.onreadystatechange = function() {
            if (xhr.readyState != 4)
              return ;
            if (xhr.status == 200 || (xhr.status == 0 && typeof xhr.responseText === 'string')) {
              callback(xhr.responseText);
            } else {
              callback(null);
            }
          };
          if (xhr.readyState == 4)
            return ;
          xhr.send(null);
        } else {
          xhr.send(null);
          if (xhr.status == 200 || (xhr.status == 0 && typeof xhr.responseText === 'string')) {
            return xhr.responseText;
          }
          return null;
        }
      }
    };
    Util.isArray = function(obj) {
      if (!obj)
        return false;
      if (obj instanceof Array)
        return true;
      if (Array.isArray)
        return Array.isArray(obj);
      return Object.prototype.toString.call(obj) === "[object Array]";
    };
    return Util;
  })();
})(require("process"));
