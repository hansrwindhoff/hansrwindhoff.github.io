/* */ 
"format cjs";
(function(Buffer, process) {
  (function(global) {
    "use strict";
    function loadProtoBuf(ByteBuffer) {
      var ProtoBuf = {};
      ProtoBuf.VERSION = "2.0.5";
      ProtoBuf.WIRE_TYPES = {};
      ProtoBuf.WIRE_TYPES.VARINT = 0;
      ProtoBuf.WIRE_TYPES.BITS64 = 1;
      ProtoBuf.WIRE_TYPES.LDELIM = 2;
      ProtoBuf.WIRE_TYPES.STARTGROUP = 3;
      ProtoBuf.WIRE_TYPES.ENDGROUP = 4;
      ProtoBuf.WIRE_TYPES.BITS32 = 5;
      ProtoBuf.TYPES = {
        "int32": {
          name: "int32",
          wireType: ProtoBuf.WIRE_TYPES.VARINT
        },
        "uint32": {
          name: "uint32",
          wireType: ProtoBuf.WIRE_TYPES.VARINT
        },
        "sint32": {
          name: "sint32",
          wireType: ProtoBuf.WIRE_TYPES.VARINT
        },
        "int64": {
          name: "int64",
          wireType: ProtoBuf.WIRE_TYPES.VARINT
        },
        "uint64": {
          name: "uint64",
          wireType: ProtoBuf.WIRE_TYPES.VARINT
        },
        "sint64": {
          name: "sint64",
          wireType: ProtoBuf.WIRE_TYPES.VARINT
        },
        "bool": {
          name: "bool",
          wireType: ProtoBuf.WIRE_TYPES.VARINT
        },
        "double": {
          name: "double",
          wireType: ProtoBuf.WIRE_TYPES.BITS64
        },
        "string": {
          name: "string",
          wireType: ProtoBuf.WIRE_TYPES.LDELIM
        },
        "bytes": {
          name: "bytes",
          wireType: ProtoBuf.WIRE_TYPES.LDELIM
        },
        "fixed32": {
          name: "fixed32",
          wireType: ProtoBuf.WIRE_TYPES.BITS32
        },
        "sfixed32": {
          name: "sfixed32",
          wireType: ProtoBuf.WIRE_TYPES.BITS32
        },
        "fixed64": {
          name: "fixed64",
          wireType: ProtoBuf.WIRE_TYPES.BITS64
        },
        "sfixed64": {
          name: "sfixed64",
          wireType: ProtoBuf.WIRE_TYPES.BITS64
        },
        "float": {
          name: "float",
          wireType: ProtoBuf.WIRE_TYPES.BITS32
        },
        "enum": {
          name: "enum",
          wireType: ProtoBuf.WIRE_TYPES.VARINT
        },
        "message": {
          name: "message",
          wireType: ProtoBuf.WIRE_TYPES.LDELIM
        }
      };
      ProtoBuf.Long = ByteBuffer.Long;
      ProtoBuf.convertFieldsToCamelCase = false;
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
      ProtoBuf.Lang = (function() {
        "use strict";
        var Lang = {
          OPEN: "{",
          CLOSE: "}",
          OPTOPEN: "[",
          OPTCLOSE: "]",
          OPTEND: ",",
          EQUAL: "=",
          END: ";",
          STRINGOPEN: '"',
          STRINGCLOSE: '"',
          COPTOPEN: '(',
          COPTCLOSE: ')',
          DELIM: /[\s\{\}=;\[\],"\(\)]/g,
          KEYWORD: /^(?:package|option|import|message|enum|extend|service|syntax|extensions)$/,
          RULE: /^(?:required|optional|repeated)$/,
          TYPE: /^(?:double|float|int32|uint32|sint32|int64|uint64|sint64|fixed32|sfixed32|fixed64|sfixed64|bool|string|bytes)$/,
          NAME: /^[a-zA-Z][a-zA-Z_0-9]*$/,
          OPTNAME: /^(?:[a-zA-Z][a-zA-Z_0-9]*|\([a-zA-Z][a-zA-Z_0-9]*\))$/,
          TYPEDEF: /^[a-zA-Z][a-zA-Z_0-9]*$/,
          TYPEREF: /^(?:\.?[a-zA-Z][a-zA-Z_0-9]*)+$/,
          FQTYPEREF: /^(?:\.[a-zA-Z][a-zA-Z_0-9]*)+$/,
          NUMBER: /^-?(?:[1-9][0-9]*|0|0x[0-9a-fA-F]+|0[0-7]+|[0-9]*\.[0-9]+)$/,
          NUMBER_DEC: /^(?:[1-9][0-9]*|0)$/,
          NUMBER_HEX: /^0x[0-9a-fA-F]+$/,
          NUMBER_OCT: /^0[0-7]+$/,
          NUMBER_FLT: /^[0-9]*\.[0-9]+$/,
          ID: /^(?:[1-9][0-9]*|0|0x[0-9a-fA-F]+|0[0-7]+)$/,
          NEGID: /^\-?(?:[1-9][0-9]*|0|0x[0-9a-fA-F]+|0[0-7]+)$/,
          WHITESPACE: /\s/,
          STRING: /"([^"\\]*(\\.[^"\\]*)*)"/g,
          BOOL: /^(?:true|false)$/i,
          ID_MIN: 1,
          ID_MAX: 0x1FFFFFFF
        };
        return Lang;
      })();
      ProtoBuf.DotProto = {};
      ProtoBuf.DotProto.Tokenizer = (function(Lang) {
        var Tokenizer = function(proto) {
          this.source = "" + proto;
          this.index = 0;
          this.line = 1;
          this.stack = [];
          this.readingString = false;
        };
        Tokenizer.prototype._readString = function() {
          Lang.STRING.lastIndex = this.index - 1;
          var match;
          if ((match = Lang.STRING.exec(this.source)) !== null) {
            var s = match[1];
            this.index = Lang.STRING.lastIndex;
            this.stack.push(Lang.STRINGCLOSE);
            return s;
          }
          throw (new Error("Illegal string value at line " + this.line + ", index " + this.index));
        };
        Tokenizer.prototype.next = function() {
          if (this.stack.length > 0) {
            return this.stack.shift();
          }
          if (this.index >= this.source.length) {
            return null;
          }
          if (this.readingString) {
            this.readingString = false;
            return this._readString();
          }
          var repeat,
              last;
          do {
            repeat = false;
            while (Lang.WHITESPACE.test(last = this.source.charAt(this.index))) {
              this.index++;
              if (last === "\n")
                this.line++;
              if (this.index === this.source.length)
                return null;
            }
            if (this.source.charAt(this.index) === '/') {
              if (this.source.charAt(++this.index) === '/') {
                while (this.source.charAt(this.index) !== "\n") {
                  this.index++;
                  if (this.index == this.source.length)
                    return null;
                }
                this.index++;
                this.line++;
                repeat = true;
              } else if (this.source.charAt(this.index) === '*') {
                last = '';
                while (last + (last = this.source.charAt(this.index)) !== '*/') {
                  this.index++;
                  if (last === "\n")
                    this.line++;
                  if (this.index === this.source.length)
                    return null;
                }
                this.index++;
                repeat = true;
              } else {
                throw (new Error("Invalid comment at line " + this.line + ": /" + this.source.charAt(this.index) + " ('/' or '*' expected)"));
              }
            }
          } while (repeat);
          if (this.index === this.source.length)
            return null;
          var end = this.index;
          Lang.DELIM.lastIndex = 0;
          var delim = Lang.DELIM.test(this.source.charAt(end));
          if (!delim) {
            end++;
            while (end < this.source.length && !Lang.DELIM.test(this.source.charAt(end))) {
              end++;
            }
          } else {
            end++;
          }
          var token = this.source.substring(this.index, this.index = end);
          if (token === Lang.STRINGOPEN) {
            this.readingString = true;
          }
          return token;
        };
        Tokenizer.prototype.peek = function() {
          if (this.stack.length == 0) {
            var token = this.next();
            if (token === null)
              return null;
            this.stack.push(token);
          }
          return this.stack[0];
        };
        Tokenizer.prototype.toString = function() {
          return "Tokenizer(" + this.index + "/" + this.source.length + " at line " + this.line + ")";
        };
        return Tokenizer;
      })(ProtoBuf.Lang);
      ProtoBuf.DotProto.Parser = (function(ProtoBuf, Lang, Tokenizer) {
        "use strict";
        var Parser = function(proto) {
          this.tn = new Tokenizer(proto);
        };
        Parser.prototype.parse = function() {
          var topLevel = {
            "name": "[ROOT]",
            "package": null,
            "messages": [],
            "enums": [],
            "imports": [],
            "options": {},
            "services": []
          };
          var token,
              header = true;
          do {
            token = this.tn.next();
            if (token == null) {
              break;
            }
            if (token == 'package') {
              if (!header) {
                throw (new Error("Illegal package definition at line " + this.tn.line + ": Must be declared before the first message or enum"));
              }
              if (topLevel["package"] !== null) {
                throw (new Error("Illegal package definition at line " + this.tn.line + ": Package already declared"));
              }
              topLevel["package"] = this._parsePackage(token);
            } else if (token == 'import') {
              if (!header) {
                throw (new Error("Illegal import definition at line " + this.tn.line + ": Must be declared before the first message or enum"));
              }
              topLevel.imports.push(this._parseImport(token));
            } else if (token === 'message') {
              this._parseMessage(topLevel, token);
              header = false;
            } else if (token === 'enum') {
              this._parseEnum(topLevel, token);
              header = false;
            } else if (token === 'option') {
              if (!header) {
                throw (new Error("Illegal option definition at line " + this.tn.line + ": Must be declared before the first message or enum"));
              }
              this._parseOption(topLevel, token);
            } else if (token === 'service') {
              this._parseService(topLevel, token);
            } else if (token === 'extend') {
              this._parseExtend(topLevel, token);
            } else if (token === 'syntax') {
              this._parseIgnoredStatement(topLevel, token);
            } else {
              throw (new Error("Illegal top level declaration at line " + this.tn.line + ": " + token));
            }
          } while (true);
          delete topLevel["name"];
          return topLevel;
        };
        Parser.prototype._parseNumber = function(val) {
          var sign = 1;
          if (val.charAt(0) == '-') {
            sign = -1;
            val = val.substring(1);
          }
          if (Lang.NUMBER_DEC.test(val)) {
            return sign * parseInt(val, 10);
          } else if (Lang.NUMBER_HEX.test(val)) {
            return sign * parseInt(val.substring(2), 16);
          } else if (Lang.NUMBER_OCT.test(val)) {
            return sign * parseInt(val.substring(1), 8);
          } else if (Lang.NUMBER_FLT.test(val)) {
            return sign * parseFloat(val);
          }
          throw (new Error("Illegal number value at line " + this.tn.line + ": " + (sign < 0 ? '-' : '') + val));
        };
        Parser.prototype._parseId = function(val, neg) {
          var id = -1;
          var sign = 1;
          if (val.charAt(0) == '-') {
            sign = -1;
            val = val.substring(1);
          }
          if (Lang.NUMBER_DEC.test(val)) {
            id = parseInt(val);
          } else if (Lang.NUMBER_HEX.test(val)) {
            id = parseInt(val.substring(2), 16);
          } else if (Lang.NUMBER_OCT.test(val)) {
            id = parseInt(val.substring(1), 8);
          } else {
            throw (new Error("Illegal ID value at line " + this.tn.line + ": " + (sign < 0 ? '-' : '') + val));
          }
          id = (sign * id) | 0;
          if (!neg && id < 0) {
            throw (new Error("Illegal ID range at line " + this.tn.line + ": " + (sign < 0 ? '-' : '') + val));
          }
          return id;
        };
        Parser.prototype._parsePackage = function(token) {
          token = this.tn.next();
          if (!Lang.TYPEREF.test(token)) {
            throw (new Error("Illegal package name at line " + this.tn.line + ": " + token));
          }
          var pkg = token;
          token = this.tn.next();
          if (token != Lang.END) {
            throw (new Error("Illegal end of package definition at line " + this.tn.line + ": " + token + " ('" + Lang.END + "' expected)"));
          }
          return pkg;
        };
        Parser.prototype._parseImport = function(token) {
          token = this.tn.next();
          if (token === "public") {
            token = this.tn.next();
          }
          if (token !== Lang.STRINGOPEN) {
            throw (new Error("Illegal begin of import value at line " + this.tn.line + ": " + token + " ('" + Lang.STRINGOPEN + "' expected)"));
          }
          var imported = this.tn.next();
          token = this.tn.next();
          if (token !== Lang.STRINGCLOSE) {
            throw (new Error("Illegal end of import value at line " + this.tn.line + ": " + token + " ('" + Lang.STRINGCLOSE + "' expected)"));
          }
          token = this.tn.next();
          if (token !== Lang.END) {
            throw (new Error("Illegal end of import definition at line " + this.tn.line + ": " + token + " ('" + Lang.END + "' expected)"));
          }
          return imported;
        };
        Parser.prototype._parseOption = function(parent, token) {
          token = this.tn.next();
          var custom = false;
          if (token == Lang.COPTOPEN) {
            custom = true;
            token = this.tn.next();
          }
          if (!Lang.NAME.test(token)) {
            if (!/google\.protobuf\./.test(token)) {
              throw (new Error("Illegal option name in message " + parent.name + " at line " + this.tn.line + ": " + token));
            }
          }
          var name = token;
          token = this.tn.next();
          if (custom) {
            if (token !== Lang.COPTCLOSE) {
              throw (new Error("Illegal custom option name delimiter in message " + parent.name + ", option " + name + " at line " + this.tn.line + ": " + token + " ('" + Lang.COPTCLOSE + "' expected)"));
            }
            name = '(' + name + ')';
            token = this.tn.next();
            if (Lang.FQTYPEREF.test(token)) {
              name += token;
              token = this.tn.next();
            }
          }
          if (token !== Lang.EQUAL) {
            throw (new Error("Illegal option operator in message " + parent.name + ", option " + name + " at line " + this.tn.line + ": " + token + " ('" + Lang.EQUAL + "' expected)"));
          }
          var value;
          token = this.tn.next();
          if (token === Lang.STRINGOPEN) {
            value = this.tn.next();
            token = this.tn.next();
            if (token !== Lang.STRINGCLOSE) {
              throw (new Error("Illegal end of option value in message " + parent.name + ", option " + name + " at line " + this.tn.line + ": " + token + " ('" + Lang.STRINGCLOSE + "' expected)"));
            }
          } else {
            if (Lang.NUMBER.test(token)) {
              value = this._parseNumber(token, true);
            } else if (Lang.TYPEREF.test(token)) {
              value = token;
            } else {
              throw (new Error("Illegal option value in message " + parent.name + ", option " + name + " at line " + this.tn.line + ": " + token));
            }
          }
          token = this.tn.next();
          if (token !== Lang.END) {
            throw (new Error("Illegal end of option in message " + parent.name + ", option " + name + " at line " + this.tn.line + ": " + token + " ('" + Lang.END + "' expected)"));
          }
          parent["options"][name] = value;
        };
        Parser.prototype._parseIgnoredBlock = function(parent, keyword) {
          var token = this.tn.next();
          if (!Lang.TYPEREF.test(token)) {
            throw (new Error("Illegal " + keyword + " type in " + parent.name + ": " + token));
          }
          var name = token;
          token = this.tn.next();
          if (token !== Lang.OPEN) {
            throw (new Error("Illegal OPEN in " + parent.name + " after " + keyword + " " + name + " at line " + this.tn.line + ": " + token));
          }
          var depth = 1;
          do {
            token = this.tn.next();
            if (token === null) {
              throw (new Error("Unexpected EOF in " + parent.name + ", " + keyword + " (ignored) at line " + this.tn.line + ": " + name));
            }
            if (token === Lang.OPEN) {
              depth++;
            } else if (token === Lang.CLOSE) {
              token = this.tn.peek();
              if (token === Lang.END)
                this.tn.next();
              depth--;
              if (depth === 0) {
                break;
              }
            }
          } while (true);
        };
        Parser.prototype._parseIgnoredStatement = function(parent, keyword) {
          var token;
          do {
            token = this.tn.next();
            if (token === null) {
              throw (new Error("Unexpected EOF in " + parent.name + ", " + keyword + " (ignored) at line " + this.tn.line));
            }
            if (token === Lang.END)
              break;
          } while (true);
        };
        Parser.prototype._parseService = function(parent, keyword) {
          var token = this.tn.next();
          if (!Lang.NAME.test(token)) {
            throw (new Error("Illegal service name at line " + this.tn.line + ": " + token));
          }
          var name = token;
          var svc = {
            "name": name,
            "rpc": {},
            "options": {}
          };
          token = this.tn.next();
          if (token !== Lang.OPEN) {
            throw (new Error("Illegal OPEN after service " + name + " at line " + this.tn.line + ": " + token + " ('" + Lang.OPEN + "' expected)"));
          }
          do {
            token = this.tn.next();
            if (token === "option") {
              this._parseOption(svc, token);
            } else if (token === 'rpc') {
              this._parseServiceRPC(svc, token);
            } else if (token !== Lang.CLOSE) {
              throw (new Error("Illegal type for service " + name + " at line " + this.tn.line + ": " + token));
            }
          } while (token !== Lang.CLOSE);
          parent["services"].push(svc);
        };
        Parser.prototype._parseServiceRPC = function(svc, token) {
          var type = token;
          token = this.tn.next();
          if (!Lang.NAME.test(token)) {
            throw (new Error("Illegal RPC method name in service " + svc["name"] + " at line " + this.tn.line + ": " + token));
          }
          var name = token;
          var method = {
            "request": null,
            "response": null,
            "options": {}
          };
          token = this.tn.next();
          if (token !== Lang.COPTOPEN) {
            throw (new Error("Illegal start of request type in RPC service " + svc["name"] + "#" + name + " at line " + this.tn.line + ": " + token + " ('" + Lang.COPTOPEN + "' expected)"));
          }
          token = this.tn.next();
          if (!Lang.TYPEREF.test(token)) {
            throw (new Error("Illegal request type in RPC service " + svc["name"] + "#" + name + " at line " + this.tn.line + ": " + token));
          }
          method["request"] = token;
          token = this.tn.next();
          if (token != Lang.COPTCLOSE) {
            throw (new Error("Illegal end of request type in RPC service " + svc["name"] + "#" + name + " at line " + this.tn.line + ": " + token + " ('" + Lang.COPTCLOSE + "' expected)"));
          }
          token = this.tn.next();
          if (token.toLowerCase() !== "returns") {
            throw (new Error("Illegal request/response delimiter in RPC service " + svc["name"] + "#" + name + " at line " + this.tn.line + ": " + token + " ('returns' expected)"));
          }
          token = this.tn.next();
          if (token != Lang.COPTOPEN) {
            throw (new Error("Illegal start of response type in RPC service " + svc["name"] + "#" + name + " at line " + this.tn.line + ": " + token + " ('" + Lang.COPTOPEN + "' expected)"));
          }
          token = this.tn.next();
          method["response"] = token;
          token = this.tn.next();
          if (token !== Lang.COPTCLOSE) {
            throw (new Error("Illegal end of response type in RPC service " + svc["name"] + "#" + name + " at line " + this.tn.line + ": " + token + " ('" + Lang.COPTCLOSE + "' expected)"));
          }
          token = this.tn.next();
          if (token === Lang.OPEN) {
            do {
              token = this.tn.next();
              if (token === 'option') {
                this._parseOption(method, token);
              } else if (token !== Lang.CLOSE) {
                throw (new Error("Illegal start of option in RPC service " + svc["name"] + "#" + name + " at line " + this.tn.line + ": " + token + " ('option' expected)"));
              }
            } while (token !== Lang.CLOSE);
          } else if (token !== Lang.END) {
            throw (new Error("Illegal method delimiter in RPC service " + svc["name"] + "#" + name + " at line " + this.tn.line + ": " + token + " ('" + Lang.END + "' or '" + Lang.OPEN + "' expected)"));
          }
          if (typeof svc[type] === 'undefined')
            svc[type] = {};
          svc[type][name] = method;
        };
        Parser.prototype._parseMessage = function(parent, token) {
          var msg = {};
          token = this.tn.next();
          if (!Lang.NAME.test(token)) {
            throw (new Error("Illegal message name" + (parent ? " in message " + parent["name"] : "") + " at line " + this.tn.line + ": " + token));
          }
          msg["name"] = token;
          token = this.tn.next();
          if (token != Lang.OPEN) {
            throw (new Error("Illegal OPEN after message " + msg.name + " at line " + this.tn.line + ": " + token + " ('" + Lang.OPEN + "' expected)"));
          }
          msg["fields"] = [];
          msg["enums"] = [];
          msg["messages"] = [];
          msg["options"] = {};
          do {
            token = this.tn.next();
            if (token === Lang.CLOSE) {
              token = this.tn.peek();
              if (token === Lang.END)
                this.tn.next();
              break;
            } else if (Lang.RULE.test(token)) {
              this._parseMessageField(msg, token);
            } else if (token === "enum") {
              this._parseEnum(msg, token);
            } else if (token === "message") {
              this._parseMessage(msg, token);
            } else if (token === "option") {
              this._parseOption(msg, token);
            } else if (token === "extensions") {
              msg["extensions"] = this._parseExtensions(msg, token);
            } else if (token === "extend") {
              this._parseExtend(msg, token);
            } else {
              throw (new Error("Illegal token in message " + msg.name + " at line " + this.tn.line + ": " + token + " (type or '" + Lang.CLOSE + "' expected)"));
            }
          } while (true);
          parent["messages"].push(msg);
          return msg;
        };
        Parser.prototype._parseMessageField = function(msg, token) {
          var fld = {};
          fld["rule"] = token;
          token = this.tn.next();
          if (!Lang.TYPE.test(token) && !Lang.TYPEREF.test(token)) {
            throw (new Error("Illegal field type in message " + msg.name + " at line " + this.tn.line + ": " + token));
          }
          fld["type"] = token;
          token = this.tn.next();
          if (!Lang.NAME.test(token)) {
            throw (new Error("Illegal field name in message " + msg.name + " at line " + this.tn.line + ": " + token));
          }
          fld["name"] = token;
          token = this.tn.next();
          if (token !== Lang.EQUAL) {
            throw (new Error("Illegal field number operator in message " + msg.name + "#" + fld.name + " at line " + this.tn.line + ": " + token + " ('" + Lang.EQUAL + "' expected)"));
          }
          token = this.tn.next();
          try {
            fld["id"] = this._parseId(token);
          } catch (e) {
            throw (new Error("Illegal field id in message " + msg.name + "#" + fld.name + " at line " + this.tn.line + ": " + token));
          }
          fld["options"] = {};
          token = this.tn.next();
          if (token === Lang.OPTOPEN) {
            this._parseFieldOptions(msg, fld, token);
            token = this.tn.next();
          }
          if (token !== Lang.END) {
            throw (new Error("Illegal field delimiter in message " + msg.name + "#" + fld.name + " at line " + this.tn.line + ": " + token + " ('" + Lang.END + "' expected)"));
          }
          msg["fields"].push(fld);
        };
        Parser.prototype._parseFieldOptions = function(msg, fld, token) {
          var first = true;
          do {
            token = this.tn.next();
            if (token === Lang.OPTCLOSE) {
              break;
            } else if (token === Lang.OPTEND) {
              if (first) {
                throw (new Error("Illegal start of message field options in message " + msg.name + "#" + fld.name + " at line " + this.tn.line + ": " + token));
              }
              token = this.tn.next();
            }
            this._parseFieldOption(msg, fld, token);
            first = false;
          } while (true);
        };
        Parser.prototype._parseFieldOption = function(msg, fld, token) {
          var custom = false;
          if (token === Lang.COPTOPEN) {
            token = this.tn.next();
            custom = true;
          }
          if (!Lang.NAME.test(token)) {
            throw (new Error("Illegal field option in message " + msg.name + "#" + fld.name + " at line " + this.tn.line + ": " + token));
          }
          var name = token;
          token = this.tn.next();
          if (custom) {
            if (token !== Lang.COPTCLOSE) {
              throw (new Error("Illegal custom field option name delimiter in message " + msg.name + "#" + fld.name + " at line " + this.tn.line + ": " + token + " (')' expected)"));
            }
            name = '(' + name + ')';
            token = this.tn.next();
            if (Lang.FQTYPEREF.test(token)) {
              name += token;
              token = this.tn.next();
            }
          }
          if (token !== Lang.EQUAL) {
            throw (new Error("Illegal field option operation in message " + msg.name + "#" + fld.name + " at line " + this.tn.line + ": " + token + " ('=' expected)"));
          }
          var value;
          token = this.tn.next();
          if (token === Lang.STRINGOPEN) {
            value = this.tn.next();
            token = this.tn.next();
            if (token != Lang.STRINGCLOSE) {
              throw (new Error("Illegal end of field value in message " + msg.name + "#" + fld.name + ", option " + name + " at line " + this.tn.line + ": " + token + " ('" + Lang.STRINGCLOSE + "' expected)"));
            }
          } else if (Lang.NUMBER.test(token, true)) {
            value = this._parseNumber(token, true);
          } else if (Lang.BOOL.test(token)) {
            value = token.toLowerCase() === 'true';
          } else if (Lang.TYPEREF.test(token)) {
            value = token;
          } else {
            throw (new Error("Illegal field option value in message " + msg.name + "#" + fld.name + ", option " + name + " at line " + this.tn.line + ": " + token));
          }
          fld["options"][name] = value;
        };
        Parser.prototype._parseEnum = function(msg, token) {
          var enm = {};
          token = this.tn.next();
          if (!Lang.NAME.test(token)) {
            throw (new Error("Illegal enum name in message " + msg.name + " at line " + this.tn.line + ": " + token));
          }
          enm["name"] = token;
          token = this.tn.next();
          if (token !== Lang.OPEN) {
            throw (new Error("Illegal OPEN after enum " + enm.name + " at line " + this.tn.line + ": " + token));
          }
          enm["values"] = [];
          enm["options"] = {};
          do {
            token = this.tn.next();
            if (token === Lang.CLOSE) {
              token = this.tn.peek();
              if (token === Lang.END)
                this.tn.next();
              break;
            }
            if (token == 'option') {
              this._parseOption(enm, token);
            } else {
              if (!Lang.NAME.test(token)) {
                throw (new Error("Illegal enum value name in enum " + enm.name + " at line " + this.tn.line + ": " + token));
              }
              this._parseEnumValue(enm, token);
            }
          } while (true);
          msg["enums"].push(enm);
        };
        Parser.prototype._parseEnumValue = function(enm, token) {
          var val = {};
          val["name"] = token;
          token = this.tn.next();
          if (token !== Lang.EQUAL) {
            throw (new Error("Illegal enum value operator in enum " + enm.name + " at line " + this.tn.line + ": " + token + " ('" + Lang.EQUAL + "' expected)"));
          }
          token = this.tn.next();
          try {
            val["id"] = this._parseId(token, true);
          } catch (e) {
            throw (new Error("Illegal enum value id in enum " + enm.name + " at line " + this.tn.line + ": " + token));
          }
          enm["values"].push(val);
          token = this.tn.next();
          if (token === Lang.OPTOPEN) {
            var opt = {'options': {}};
            this._parseFieldOptions(enm, opt, token);
            token = this.tn.next();
          }
          if (token !== Lang.END) {
            throw (new Error("Illegal enum value delimiter in enum " + enm.name + " at line " + this.tn.line + ": " + token + " ('" + Lang.END + "' expected)"));
          }
        };
        Parser.prototype._parseExtensions = function(msg, token) {
          var range = [];
          token = this.tn.next();
          if (token === "min") {
            range.push(Lang.ID_MIN);
          } else if (token === "max") {
            range.push(Lang.ID_MAX);
          } else {
            range.push(this._parseNumber(token));
          }
          token = this.tn.next();
          if (token !== 'to') {
            throw ("Illegal extensions delimiter in message " + msg.name + " at line " + this.tn.line + " ('to' expected)");
          }
          token = this.tn.next();
          if (token === "min") {
            range.push(Lang.ID_MIN);
          } else if (token === "max") {
            range.push(Lang.ID_MAX);
          } else {
            range.push(this._parseNumber(token));
          }
          token = this.tn.next();
          if (token !== Lang.END) {
            throw (new Error("Illegal extension delimiter in message " + msg.name + " at line " + this.tn.line + ": " + token + " ('" + Lang.END + "' expected)"));
          }
          return range;
        };
        Parser.prototype._parseExtend = function(parent, token) {
          token = this.tn.next();
          if (!Lang.TYPEREF.test(token)) {
            throw (new Error("Illegal extended message name at line " + this.tn.line + ": " + token));
          }
          var ext = {};
          ext["ref"] = token;
          ext["fields"] = [];
          token = this.tn.next();
          if (token !== Lang.OPEN) {
            throw (new Error("Illegal OPEN in extend " + ext.name + " at line " + this.tn.line + ": " + token + " ('" + Lang.OPEN + "' expected)"));
          }
          do {
            token = this.tn.next();
            if (token === Lang.CLOSE) {
              token = this.tn.peek();
              if (token == Lang.END)
                this.tn.next();
              break;
            } else if (Lang.RULE.test(token)) {
              this._parseMessageField(ext, token);
            } else {
              throw (new Error("Illegal token in extend " + ext.name + " at line " + this.tn.line + ": " + token + " (rule or '" + Lang.CLOSE + "' expected)"));
            }
          } while (true);
          parent["messages"].push(ext);
          return ext;
        };
        Parser.prototype.toString = function() {
          return "Parser";
        };
        return Parser;
      })(ProtoBuf, ProtoBuf.Lang, ProtoBuf.DotProto.Tokenizer);
      ProtoBuf.Reflect = (function(ProtoBuf) {
        "use strict";
        var Reflect = {};
        var T = function(parent, name) {
          this.parent = parent;
          this.name = name;
        };
        T.prototype.fqn = function() {
          var name = this.name,
              ptr = this;
          do {
            ptr = ptr.parent;
            if (ptr == null)
              break;
            name = ptr.name + "." + name;
          } while (true);
          return name;
        };
        T.prototype.toString = function(includeClass) {
          var name = this.fqn();
          if (includeClass) {
            if (this instanceof Message) {
              name = "Message " + name;
            } else if (this instanceof Message.Field) {
              name = "Message.Field " + name;
            } else if (this instanceof Enum) {
              name = "Enum " + name;
            } else if (this instanceof Enum.Value) {
              name = "Enum.Value " + name;
            } else if (this instanceof Service) {
              name = "Service " + name;
            } else if (this instanceof Service.Method) {
              if (this instanceof Service.RPCMethod) {
                name = "Service.RPCMethod " + name;
              } else {
                name = "Service.Method " + name;
              }
            } else if (this instanceof Namespace) {
              name = "Namespace " + name;
            }
          }
          return name;
        };
        T.prototype.build = function() {
          throw (new Error(this.toString(true) + " cannot be built directly"));
        };
        Reflect.T = T;
        var Namespace = function(parent, name, options) {
          T.call(this, parent, name);
          this.children = [];
          this.options = options || {};
        };
        Namespace.prototype = Object.create(T.prototype);
        Namespace.prototype.getChildren = function(type) {
          type = type || null;
          if (type == null) {
            return this.children.slice();
          }
          var children = [];
          for (var i = 0; i < this.children.length; i++) {
            if (this.children[i] instanceof type) {
              children.push(this.children[i]);
            }
          }
          return children;
        };
        Namespace.prototype.addChild = function(child) {
          var other;
          if (other = this.getChild(child.name)) {
            if (other instanceof Message.Field && other.name !== other.originalName && !this.hasChild(other.originalName)) {
              other.name = other.originalName;
            } else if (child instanceof Message.Field && child.name !== child.originalName && !this.hasChild(child.originalName)) {
              child.name = child.originalName;
            } else {
              throw (new Error("Duplicate name in namespace " + this.toString(true) + ": " + child.name));
            }
          }
          this.children.push(child);
        };
        Namespace.prototype.hasChild = function(nameOrId) {
          var i;
          if (typeof nameOrId == 'number') {
            for (i = 0; i < this.children.length; i++)
              if (typeof this.children[i].id !== 'undefined' && this.children[i].id == nameOrId)
                return true;
          } else {
            for (i = 0; i < this.children.length; i++)
              if (typeof this.children[i].name !== 'undefined' && this.children[i].name == nameOrId)
                return true;
          }
          return false;
        };
        Namespace.prototype.getChild = function(nameOrId) {
          var i;
          if (typeof nameOrId == 'number') {
            for (i = 0; i < this.children.length; i++)
              if (typeof this.children[i].id !== 'undefined' && this.children[i].id == nameOrId)
                return this.children[i];
          } else {
            for (i = 0; i < this.children.length; i++)
              if (typeof this.children[i].name !== 'undefined' && this.children[i].name == nameOrId)
                return this.children[i];
          }
          return null;
        };
        Namespace.prototype.resolve = function(qn, excludeFields) {
          var part = qn.split(".");
          var ptr = this,
              i = 0;
          if (part[i] == "") {
            while (ptr.parent != null) {
              ptr = ptr.parent;
            }
            i++;
          }
          var child;
          do {
            do {
              child = ptr.getChild(part[i]);
              if (!child || !(child instanceof Reflect.T) || (excludeFields && child instanceof Reflect.Message.Field)) {
                ptr = null;
                break;
              }
              ptr = child;
              i++;
            } while (i < part.length);
            if (ptr != null)
              break;
            if (this.parent !== null) {
              return this.parent.resolve(qn, excludeFields);
            }
          } while (ptr != null);
          return ptr;
        };
        Namespace.prototype.build = function() {
          var ns = {};
          var children = this.getChildren(),
              child;
          for (var i = 0; i < children.length; i++) {
            child = children[i];
            if (child instanceof Namespace) {
              ns[child.name] = child.build();
            }
          }
          if (Object.defineProperty) {
            Object.defineProperty(ns, "$options", {
              "value": this.buildOpt(),
              "enumerable": false,
              "configurable": false,
              "writable": false
            });
          }
          return ns;
        };
        Namespace.prototype.buildOpt = function() {
          var opt = {};
          var keys = Object.keys(this.options);
          for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var val = this.options[keys[i]];
            opt[key] = val;
          }
          return opt;
        };
        Namespace.prototype.getOption = function(name) {
          if (typeof name == 'undefined') {
            return this.options;
          }
          return typeof this.options[name] != 'undefined' ? this.options[name] : null;
        };
        Reflect.Namespace = Namespace;
        var Message = function(parent, name, options) {
          Namespace.call(this, parent, name, options);
          this.extensions = [ProtoBuf.Lang.ID_MIN, ProtoBuf.Lang.ID_MAX];
          this.clazz = null;
        };
        Message.prototype = Object.create(Namespace.prototype);
        Message.prototype.build = function(rebuild) {
          if (this.clazz && !rebuild)
            return this.clazz;
          var clazz = (function(ProtoBuf, T) {
            var fields = T.getChildren(Reflect.Message.Field);
            var Message = function(values) {
              ProtoBuf.Builder.Message.call(this);
              var i,
                  field;
              for (i = 0; i < fields.length; i++) {
                field = fields[i];
                this[field.name] = (field.repeated) ? [] : null;
              }
              for (i = 0; i < fields.length; i++) {
                field = fields[i];
                if (typeof field.options['default'] != 'undefined') {
                  try {
                    this.set(field.name, field.options['default']);
                  } catch (e) {
                    throw (new Error("[INTERNAL] " + e));
                  }
                }
              }
              if (arguments.length == 1 && typeof values == 'object' && typeof values.encode != 'function' && !ProtoBuf.Util.isArray(values) && !(values instanceof ByteBuffer) && !(values instanceof ArrayBuffer) && !(ProtoBuf.Long && values instanceof ProtoBuf.Long)) {
                var keys = Object.keys(values);
                for (i = 0; i < keys.length; i++) {
                  this.set(keys[i], values[keys[i]]);
                }
              } else {
                for (i = 0; i < arguments.length; i++) {
                  if (i < fields.length) {
                    this.set(fields[i].name, arguments[i]);
                  }
                }
              }
            };
            Message.prototype = Object.create(ProtoBuf.Builder.Message.prototype);
            Message.prototype.add = function(key, value) {
              var field = T.getChild(key);
              if (!field) {
                throw (new Error(this + "#" + key + " is undefined"));
              }
              if (!(field instanceof ProtoBuf.Reflect.Message.Field)) {
                throw (new Error(this + "#" + key + " is not a field: " + field.toString(true)));
              }
              if (!field.repeated) {
                throw (new Error(this + "#" + key + " is not a repeated field"));
              }
              if (this[field.name] === null)
                this[field.name] = [];
              this[field.name].push(field.verifyValue(value, true));
            };
            Message.prototype.set = function(key, value) {
              var field = T.getChild(key);
              if (!field) {
                throw (new Error(this + "#" + key + " is not a field: undefined"));
              }
              if (!(field instanceof ProtoBuf.Reflect.Message.Field)) {
                throw (new Error(this + "#" + key + " is not a field: " + field.toString(true)));
              }
              this[field.name] = field.verifyValue(value);
            };
            Message.prototype.get = function(key) {
              var field = T.getChild(key);
              if (!field || !(field instanceof ProtoBuf.Reflect.Message.Field)) {
                throw (new Error(this + "#" + key + " is not a field: undefined"));
              }
              if (!(field instanceof ProtoBuf.Reflect.Message.Field)) {
                throw (new Error(this + "#" + key + " is not a field: " + field.toString(true)));
              }
              return this[field.name];
            };
            for (var i = 0; i < fields.length; i++) {
              var field = fields[i];
              (function(field) {
                var Name = field.originalName.replace(/(_[a-zA-Z])/g, function(match) {
                  return match.toUpperCase().replace('_', '');
                });
                Name = Name.substring(0, 1).toUpperCase() + Name.substring(1);
                var name = field.originalName.replace(/([A-Z])/g, function(match) {
                  return "_" + match;
                });
                if (!T.hasChild("set" + Name)) {
                  Message.prototype["set" + Name] = function(value) {
                    this.set(field.name, value);
                  };
                }
                if (!T.hasChild("set_" + name)) {
                  Message.prototype["set_" + name] = function(value) {
                    this.set(field.name, value);
                  };
                }
                if (!T.hasChild("get" + Name)) {
                  Message.prototype["get" + Name] = function() {
                    return this.get(field.name);
                  };
                }
                if (!T.hasChild("get_" + name)) {
                  Message.prototype["get_" + name] = function() {
                    return this.get(field.name);
                  };
                }
              })(field);
            }
            Message.prototype.encode = function(buffer) {
              buffer = buffer || new ByteBuffer();
              var le = buffer.littleEndian;
              try {
                return T.encode(this, buffer.LE()).flip().LE(le);
              } catch (e) {
                buffer.LE(le);
                throw (e);
              }
            };
            Message.prototype.encodeAB = function() {
              var enc;
              try {
                return this.encode().toArrayBuffer();
              } catch (err) {
                if (err["encoded"])
                  err["encoded"] = err["encoded"].toArrayBuffer();
                throw (err);
              }
            };
            Message.prototype.toArrayBuffer = Message.prototype.encodeAB;
            Message.prototype.encodeNB = function() {
              try {
                return this.encode().toBuffer();
              } catch (err) {
                if (err["encoded"])
                  err["encoded"] = err["encoded"].toBuffer();
                throw (err);
              }
            };
            Message.prototype.toBuffer = Message.prototype.encodeNB;
            Message.prototype.encode64 = function() {
              try {
                return this.encode().toBase64();
              } catch (err) {
                if (err["encoded"])
                  err["encoded"] = err["encoded"].toBase64();
                throw (err);
              }
            };
            Message.prototype.toBase64 = Message.prototype.encode64;
            Message.prototype.encodeHex = function() {
              try {
                return this.encode().toHex();
              } catch (err) {
                if (err["encoded"])
                  err["encoded"] = err["encoded"].toHex();
                throw (err);
              }
            };
            Message.prototype.toHex = Message.prototype.encodeHex;
            Message.decode = function(buffer, enc) {
              if (buffer === null)
                throw (new Error("buffer must not be null"));
              if (typeof buffer === 'string') {
                buffer = ByteBuffer.wrap(buffer, enc ? enc : "base64");
              }
              buffer = buffer instanceof ByteBuffer ? buffer : ByteBuffer.wrap(buffer);
              var le = buffer.littleEndian;
              try {
                var msg = T.decode(buffer.LE());
                buffer.LE(le);
                return msg;
              } catch (e) {
                buffer.LE(le);
                throw (e);
              }
            };
            Message.decode64 = function(str) {
              return Message.decode(str, "base64");
            };
            Message.decodeHex = function(str) {
              return Message.decode(str, "hex");
            };
            Message.prototype.toString = function() {
              return T.toString();
            };
            var O_o;
            if (Object.defineProperty) {
              Object.defineProperty(Message, '$options', {
                'value': T.buildOpt(),
                'enumerable': false,
                'configurable': false,
                'writable': false
              });
            }
            return Message;
          })(ProtoBuf, this);
          var children = this.getChildren();
          for (var i = 0; i < children.length; i++) {
            if (children[i] instanceof Enum) {
              clazz[children[i]['name']] = children[i].build();
            } else if (children[i] instanceof Message) {
              clazz[children[i]['name']] = children[i].build();
            } else if (children[i] instanceof Message.Field) {} else {
              throw (new Error("Illegal reflect child of " + this.toString(true) + ": " + children[i].toString(true)));
            }
          }
          return this.clazz = clazz;
        };
        Message.prototype.encode = function(message, buffer) {
          var fields = this.getChildren(Message.Field),
              fieldMissing = null;
          for (var i = 0; i < fields.length; i++) {
            var val = message.get(fields[i].name);
            if (fields[i].required && val === null) {
              if (fieldMissing === null)
                fieldMissing = fields[i];
            } else {
              fields[i].encode(val, buffer);
            }
          }
          if (fieldMissing !== null) {
            var err = new Error("Missing at least one required field for " + this.toString(true) + ": " + fieldMissing);
            err["encoded"] = buffer;
            throw (err);
          }
          return buffer;
        };
        Message.prototype.decode = function(buffer, length) {
          length = typeof length === 'number' ? length : -1;
          var start = buffer.offset;
          var msg = new (this.clazz)();
          while (buffer.offset < start + length || (length == -1 && buffer.remaining() > 0)) {
            var tag = buffer.readVarint32();
            var wireType = tag & 0x07,
                id = tag >> 3;
            var field = this.getChild(id);
            if (!field) {
              switch (wireType) {
                case ProtoBuf.WIRE_TYPES.VARINT:
                  buffer.readVarint32();
                  break;
                case ProtoBuf.WIRE_TYPES.BITS32:
                  buffer.offset += 4;
                  break;
                case ProtoBuf.WIRE_TYPES.BITS64:
                  buffer.offset += 8;
                  break;
                case ProtoBuf.WIRE_TYPES.LDELIM:
                  var len = buffer.readVarint32();
                  buffer.offset += len;
                  break;
                default:
                  throw (new Error("Illegal wire type of unknown field " + id + " in " + this.toString(true) + "#decode: " + wireType));
              }
              continue;
            }
            if (field.repeated && !field.options["packed"]) {
              msg.add(field.name, field.decode(wireType, buffer));
            } else {
              msg.set(field.name, field.decode(wireType, buffer));
            }
          }
          var fields = this.getChildren(ProtoBuf.Reflect.Field);
          for (var i = 0; i < fields.length; i++) {
            if (fields[i].required && msg[fields[i].name] === null) {
              var err = new Error("Missing at least one required field for " + this.toString(true) + ": " + fields[i].name);
              err["decoded"] = msg;
              throw (err);
            }
          }
          return msg;
        };
        Reflect.Message = Message;
        var Field = function(message, rule, type, name, id, options) {
          T.call(this, message, name);
          this.required = rule == "required";
          this.repeated = rule == "repeated";
          this.type = type;
          this.resolvedType = null;
          this.id = id;
          this.options = options || {};
          this.originalName = this.name;
          if (ProtoBuf.convertFieldsToCamelCase) {
            this.name = this.name.replace(/_([a-zA-Z])/g, function($0, $1) {
              return $1.toUpperCase();
            });
          }
        };
        Field.prototype = Object.create(T.prototype);
        Field.prototype.verifyValue = function(value, skipRepeated) {
          skipRepeated = skipRepeated || false;
          if (value === null) {
            if (this.required) {
              throw (new Error("Illegal value for " + this.toString(true) + ": " + value + " (required)"));
            }
            return null;
          }
          var i;
          if (this.repeated && !skipRepeated) {
            if (!ProtoBuf.Util.isArray(value)) {
              value = [value];
            }
            var res = [];
            for (i = 0; i < value.length; i++) {
              res.push(this.verifyValue(value[i], true));
            }
            return res;
          }
          if (!this.repeated && ProtoBuf.Util.isArray(value)) {
            throw (new Error("Illegal value for " + this.toString(true) + ": " + value + " (no array expected)"));
          }
          if (this.type == ProtoBuf.TYPES["int32"] || this.type == ProtoBuf.TYPES["sint32"] || this.type == ProtoBuf.TYPES["sfixed32"]) {
            return isNaN(i = parseInt(value, 10)) ? i : i | 0;
          }
          if (this.type == ProtoBuf.TYPES["uint32"] || this.type == ProtoBuf.TYPES["fixed32"]) {
            return isNaN(i = parseInt(value, 10)) ? i : i >>> 0;
          }
          if (ProtoBuf.Long) {
            if (this.type == ProtoBuf.TYPES["int64"] || this.type == ProtoBuf.TYPES["sint64"] || this.type == ProtoBuf.TYPES["sfixed64"]) {
              if (!(typeof value == 'object' && value instanceof ProtoBuf.Long)) {
                return ProtoBuf.Long.fromNumber(value, false);
              }
              return value.unsigned ? value.toSigned() : value;
            }
            if (this.type == ProtoBuf.TYPES["uint64"] || this.type == ProtoBuf.TYPES["fixed64"]) {
              if (!(typeof value == 'object' && value instanceof ProtoBuf.Long)) {
                return ProtoBuf.Long.fromNumber(value, true);
              }
              return value.unsigned ? value : value.toUnsigned();
            }
          }
          if (this.type == ProtoBuf.TYPES["bool"]) {
            if (typeof value === 'string')
              return value === 'true';
            else
              return !!value;
          }
          if (this.type == ProtoBuf.TYPES["float"] || this.type == ProtoBuf.TYPES["double"]) {
            return parseFloat(value);
          }
          if (this.type == ProtoBuf.TYPES["string"]) {
            return "" + value;
          }
          if (this.type == ProtoBuf.TYPES["bytes"]) {
            if (value && value instanceof ByteBuffer) {
              return value;
            }
            return ByteBuffer.wrap(value);
          }
          if (this.type == ProtoBuf.TYPES["enum"]) {
            var values = this.resolvedType.getChildren(Enum.Value);
            for (i = 0; i < values.length; i++) {
              if (values[i].name == value) {
                return values[i].id;
              } else if (values[i].id == value) {
                return values[i].id;
              }
            }
            throw (new Error("Illegal value for " + this.toString(true) + ": " + value + " (not a valid enum value)"));
          }
          if (this.type == ProtoBuf.TYPES["message"]) {
            if (typeof value !== 'object') {
              throw (new Error("Illegal value for " + this.toString(true) + ": " + value + " (object expected)"));
            }
            if (value instanceof this.resolvedType.clazz) {
              return value;
            }
            return new (this.resolvedType.clazz)(value);
          }
          throw (new Error("[INTERNAL] Illegal value for " + this.toString(true) + ": " + value + " (undefined type " + this.type + ")"));
        };
        Field.prototype.encode = function(value, buffer) {
          value = this.verifyValue(value);
          if (this.type == null || typeof this.type != 'object') {
            throw (new Error("[INTERNAL] Unresolved type in " + this.toString(true) + ": " + this.type));
          }
          if (value === null || (this.repeated && value.length == 0))
            return buffer;
          try {
            if (this.repeated) {
              var i;
              if (this.options["packed"]) {
                buffer.writeVarint32((this.id << 3) | ProtoBuf.WIRE_TYPES.LDELIM);
                buffer.ensureCapacity(buffer.offset += 1);
                var start = buffer.offset;
                for (i = 0; i < value.length; i++) {
                  this.encodeValue(value[i], buffer);
                }
                var len = buffer.offset - start;
                var varintLen = ByteBuffer.calculateVarint32(len);
                if (varintLen > 1) {
                  var contents = buffer.slice(start, buffer.offset);
                  start += varintLen - 1;
                  buffer.offset = start;
                  buffer.append(contents);
                }
                buffer.writeVarint32(len, start - varintLen);
              } else {
                for (i = 0; i < value.length; i++) {
                  buffer.writeVarint32((this.id << 3) | this.type.wireType);
                  this.encodeValue(value[i], buffer);
                }
              }
            } else {
              buffer.writeVarint32((this.id << 3) | this.type.wireType);
              this.encodeValue(value, buffer);
            }
          } catch (e) {
            throw (new Error("Illegal value for " + this.toString(true) + ": " + value + " (" + e + ")"));
          }
          return buffer;
        };
        Field.prototype.encodeValue = function(value, buffer) {
          if (value === null)
            return ;
          if (this.type == ProtoBuf.TYPES["int32"] || this.type == ProtoBuf.TYPES["uint32"]) {
            buffer.writeVarint32(value);
          } else if (this.type == ProtoBuf.TYPES["sint32"]) {
            buffer.writeZigZagVarint32(value);
          } else if (this.type == ProtoBuf.TYPES["fixed32"]) {
            buffer.writeUint32(value);
          } else if (this.type == ProtoBuf.TYPES["sfixed32"]) {
            buffer.writeInt32(value);
          } else if (this.type == ProtoBuf.TYPES["int64"] || this.type == ProtoBuf.TYPES["uint64"]) {
            buffer.writeVarint64(value);
          } else if (this.type == ProtoBuf.TYPES["sint64"]) {
            buffer.writeZigZagVarint64(value);
          } else if (this.type == ProtoBuf.TYPES["fixed64"]) {
            buffer.writeUint64(value);
          } else if (this.type == ProtoBuf.TYPES["sfixed64"]) {
            buffer.writeInt64(value);
          } else if (this.type == ProtoBuf.TYPES["bool"]) {
            if (typeof value === 'string')
              buffer.writeVarint32(value.toLowerCase() === 'false' ? 0 : !!value);
            else
              buffer.writeVarint32(value ? 1 : 0);
          } else if (this.type == ProtoBuf.TYPES["enum"]) {
            buffer.writeVarint32(value);
          } else if (this.type == ProtoBuf.TYPES["float"]) {
            buffer.writeFloat32(value);
          } else if (this.type == ProtoBuf.TYPES["double"]) {
            buffer.writeFloat64(value);
          } else if (this.type == ProtoBuf.TYPES["string"]) {
            buffer.writeVString(value);
          } else if (this.type == ProtoBuf.TYPES["bytes"]) {
            if (value.offset > value.length) {
              buffer = buffer.clone().flip();
            }
            buffer.writeVarint32(value.remaining());
            buffer.append(value);
          } else if (this.type == ProtoBuf.TYPES["message"]) {
            var bb = new ByteBuffer().LE();
            this.resolvedType.encode(value, bb);
            buffer.writeVarint32(bb.offset);
            buffer.append(bb.flip());
          } else {
            throw (new Error("[INTERNAL] Illegal value to encode in " + this.toString(true) + ": " + value + " (unknown type)"));
          }
          return buffer;
        };
        Field.prototype.decode = function(wireType, buffer, skipRepeated) {
          var value,
              nBytes;
          if (wireType != this.type.wireType && (skipRepeated || (wireType != ProtoBuf.WIRE_TYPES.LDELIM || !this.repeated))) {
            throw (new Error("Illegal wire type for field " + this.toString(true) + ": " + wireType + " (" + this.type.wireType + " expected)"));
          }
          if (wireType == ProtoBuf.WIRE_TYPES.LDELIM && this.repeated && this.options["packed"]) {
            if (!skipRepeated) {
              nBytes = buffer.readVarint32();
              nBytes = buffer.offset + nBytes;
              var values = [];
              while (buffer.offset < nBytes) {
                values.push(this.decode(this.type.wireType, buffer, true));
              }
              return values;
            }
          }
          if (this.type == ProtoBuf.TYPES["int32"]) {
            return buffer.readVarint32() | 0;
          }
          if (this.type == ProtoBuf.TYPES["uint32"]) {
            return buffer.readVarint32() >>> 0;
          }
          if (this.type == ProtoBuf.TYPES["sint32"]) {
            return buffer.readZigZagVarint32() | 0;
          }
          if (this.type == ProtoBuf.TYPES["fixed32"]) {
            return buffer.readUint32() >>> 0;
          }
          if (this.type == ProtoBuf.TYPES["sfixed32"]) {
            return buffer.readInt32() | 0;
          }
          if (this.type == ProtoBuf.TYPES["int64"]) {
            return buffer.readVarint64();
          }
          if (this.type == ProtoBuf.TYPES["uint64"]) {
            return buffer.readVarint64().toUnsigned();
          }
          if (this.type == ProtoBuf.TYPES["sint64"]) {
            return buffer.readZigZagVarint64();
          }
          if (this.type == ProtoBuf.TYPES["fixed64"]) {
            return buffer.readUint64();
          }
          if (this.type == ProtoBuf.TYPES["sfixed64"]) {
            return buffer.readInt64();
          }
          if (this.type == ProtoBuf.TYPES["bool"]) {
            return !!buffer.readVarint32();
          }
          if (this.type == ProtoBuf.TYPES["enum"]) {
            return buffer.readVarint32();
          }
          if (this.type == ProtoBuf.TYPES["float"]) {
            return buffer.readFloat();
          }
          if (this.type == ProtoBuf.TYPES["double"]) {
            return buffer.readDouble();
          }
          if (this.type == ProtoBuf.TYPES["string"]) {
            return buffer.readVString();
          }
          if (this.type == ProtoBuf.TYPES["bytes"]) {
            nBytes = buffer.readVarint32();
            if (buffer.remaining() < nBytes) {
              throw (new Error("Illegal number of bytes for " + this.toString(true) + ": " + nBytes + " required but got only " + buffer.remaining()));
            }
            value = buffer.clone();
            value.length = value.offset + nBytes;
            buffer.offset += nBytes;
            return value;
          }
          if (this.type == ProtoBuf.TYPES["message"]) {
            nBytes = buffer.readVarint32();
            return this.resolvedType.decode(buffer, nBytes);
          }
          throw (new Error("[INTERNAL] Illegal wire type for " + this.toString(true) + ": " + wireType));
        };
        Reflect.Message.Field = Field;
        var Enum = function(parent, name, options) {
          Namespace.call(this, parent, name, options);
          this.object = null;
        };
        Enum.prototype = Object.create(Namespace.prototype);
        Enum.prototype.build = function() {
          var enm = {};
          var values = this.getChildren(Enum.Value);
          for (var i = 0; i < values.length; i++) {
            enm[values[i]['name']] = values[i]['id'];
          }
          if (Object.defineProperty) {
            Object.defineProperty(enm, '$options', {
              'value': this.buildOpt(),
              'enumerable': false,
              'configurable': false,
              'writable': false
            });
          }
          return this.object = enm;
        };
        Reflect.Enum = Enum;
        var Value = function(enm, name, id) {
          T.call(this, enm, name);
          this.id = id;
        };
        Value.prototype = Object.create(T.prototype);
        Reflect.Enum.Value = Value;
        var Service = function(root, name, options) {
          Namespace.call(this, root, name, options);
          this.clazz = null;
        };
        Service.prototype = Object.create(Namespace.prototype);
        Service.prototype.build = function(rebuild) {
          if (this.clazz && !rebuild)
            return this.clazz;
          return this.clazz = (function(ProtoBuf, T) {
            var Service = function(rpcImpl) {
              ProtoBuf.Builder.Service.call(this);
              this.rpcImpl = rpcImpl || function(name, msg, callback) {
                setTimeout(callback.bind(this, new Error("Not implemented, see: https://github.com/dcodeIO/ProtoBuf.js/wiki/Services")), 0);
              };
            };
            Service.prototype = Object.create(ProtoBuf.Builder.Service.prototype);
            if (Object.defineProperty) {
              Object.defineProperty(Service, "$options", {
                "value": T.buildOpt(),
                "enumerable": false,
                "configurable": false,
                "writable": false
              });
              Object.defineProperty(Service.prototype, "$options", {
                "value": Service["$options"],
                "enumerable": false,
                "configurable": false,
                "writable": false
              });
            }
            var rpc = T.getChildren(Reflect.Service.RPCMethod);
            for (var i = 0; i < rpc.length; i++) {
              (function(method) {
                Service.prototype[method.name] = function(req, callback) {
                  try {
                    if (!req || !(req instanceof method.resolvedRequestType.clazz)) {
                      setTimeout(callback.bind(this, new Error("Illegal request type provided to service method " + T.name + "#" + method.name)));
                    }
                    this.rpcImpl(method.fqn(), req, function(err, res) {
                      if (err) {
                        callback(err);
                        return ;
                      }
                      try {
                        res = method.resolvedResponseType.clazz.decode(res);
                      } catch (notABuffer) {}
                      if (!res || !(res instanceof method.resolvedResponseType.clazz)) {
                        callback(new Error("Illegal response type received in service method " + T.name + "#" + method.name));
                        return ;
                      }
                      callback(null, res);
                    });
                  } catch (err) {
                    setTimeout(callback.bind(this, err), 0);
                  }
                };
                Service[method.name] = function(rpcImpl, req, callback) {
                  new Service(rpcImpl)[method.name](req, callback);
                };
                if (Object.defineProperty) {
                  Object.defineProperty(Service[method.name], "$options", {
                    "value": method.buildOpt(),
                    "enumerable": false,
                    "configurable": false,
                    "writable": false
                  });
                  Object.defineProperty(Service.prototype[method.name], "$options", {
                    "value": Service[method.name]["$options"],
                    "enumerable": false,
                    "configurable": false,
                    "writable": false
                  });
                }
              })(rpc[i]);
            }
            return Service;
          })(ProtoBuf, this);
        };
        Reflect.Service = Service;
        var Method = function(svc, name, options) {
          T.call(this, svc, name);
          this.options = options || {};
        };
        Method.prototype = Object.create(T.prototype);
        Method.prototype.buildOpt = Namespace.prototype.buildOpt;
        Reflect.Service.Method = Method;
        var RPCMethod = function(svc, name, request, response, options) {
          Method.call(this, svc, name, options);
          this.requestName = request;
          this.responseName = response;
          this.resolvedRequestType = null;
          this.resolvedResponseType = null;
        };
        RPCMethod.prototype = Object.create(Method.prototype);
        Reflect.Service.RPCMethod = RPCMethod;
        return Reflect;
      })(ProtoBuf);
      ProtoBuf.Builder = (function(ProtoBuf, Lang, Reflect) {
        "use strict";
        var Builder = function() {
          this.ns = new Reflect.Namespace(null, "");
          this.ptr = this.ns;
          this.resolved = false;
          this.result = null;
          this.files = {};
          this.importRoot = null;
        };
        Builder.prototype.reset = function() {
          this.ptr = this.ns;
        };
        Builder.prototype.define = function(pkg, options) {
          if (typeof pkg !== 'string' || !Lang.TYPEREF.test(pkg)) {
            throw (new Error("Illegal package name: " + pkg));
          }
          var part = pkg.split("."),
              i;
          for (i = 0; i < part.length; i++) {
            if (!Lang.NAME.test(part[i])) {
              throw (new Error("Illegal package name: " + part[i]));
            }
          }
          for (i = 0; i < part.length; i++) {
            if (!this.ptr.hasChild(part[i])) {
              this.ptr.addChild(new Reflect.Namespace(this.ptr, part[i], options));
            }
            this.ptr = this.ptr.getChild(part[i]);
          }
          return this;
        };
        Builder.isValidMessage = function(def) {
          if (typeof def["name"] !== 'string' || !Lang.NAME.test(def["name"])) {
            return false;
          }
          if (typeof def["values"] !== 'undefined' || typeof def["rpc"] !== 'undefined') {
            return false;
          }
          var i;
          if (typeof def["fields"] !== 'undefined') {
            if (!ProtoBuf.Util.isArray(def["fields"])) {
              return false;
            }
            var ids = [],
                id;
            for (i = 0; i < def["fields"].length; i++) {
              if (!Builder.isValidMessageField(def["fields"][i])) {
                return false;
              }
              id = parseInt(def["id"], 10);
              if (ids.indexOf(id) >= 0) {
                return false;
              }
              ids.push(id);
            }
            ids = null;
          }
          if (typeof def["enums"] !== 'undefined') {
            if (!ProtoBuf.Util.isArray(def["enums"])) {
              return false;
            }
            for (i = 0; i < def["enums"].length; i++) {
              if (!Builder.isValidEnum(def["enums"][i])) {
                return false;
              }
            }
          }
          if (typeof def["messages"] !== 'undefined') {
            if (!ProtoBuf.Util.isArray(def["messages"])) {
              return false;
            }
            for (i = 0; i < def["messages"].length; i++) {
              if (!Builder.isValidMessage(def["messages"][i]) && !Builder.isValidExtend(def["messages"][i])) {
                return false;
              }
            }
          }
          if (typeof def["extensions"] !== 'undefined') {
            if (!ProtoBuf.Util.isArray(def["extensions"]) || def["extensions"].length !== 2 || typeof def["extensions"][0] !== 'number' || typeof def["extensions"][1] !== 'number') {
              return false;
            }
          }
          return true;
        };
        Builder.isValidMessageField = function(def) {
          if (typeof def["rule"] !== 'string' || typeof def["name"] !== 'string' || typeof def["type"] !== 'string' || typeof def["id"] === 'undefined') {
            return false;
          }
          if (!Lang.RULE.test(def["rule"]) || !Lang.NAME.test(def["name"]) || !Lang.TYPEREF.test(def["type"]) || !Lang.ID.test("" + def["id"])) {
            return false;
          }
          if (typeof def["options"] != 'undefined') {
            if (typeof def["options"] != 'object') {
              return false;
            }
            var keys = Object.keys(def["options"]);
            for (var i = 0; i < keys.length; i++) {
              if (!Lang.OPTNAME.test(keys[i]) || (typeof def["options"][keys[i]] !== 'string' && typeof def["options"][keys[i]] !== 'number' && typeof def["options"][keys[i]] !== 'boolean')) {
                return false;
              }
            }
          }
          return true;
        };
        Builder.isValidEnum = function(def) {
          if (typeof def["name"] !== 'string' || !Lang.NAME.test(def["name"])) {
            return false;
          }
          if (typeof def["values"] === 'undefined' || !ProtoBuf.Util.isArray(def["values"]) || def["values"].length == 0) {
            return false;
          }
          for (var i = 0; i < def["values"].length; i++) {
            if (typeof def["values"][i] != "object") {
              return false;
            }
            if (typeof def["values"][i]["name"] !== 'string' || typeof def["values"][i]["id"] === 'undefined') {
              return false;
            }
            if (!Lang.NAME.test(def["values"][i]["name"]) || !Lang.NEGID.test("" + def["values"][i]["id"])) {
              return false;
            }
          }
          return true;
        };
        Builder.prototype.create = function(defs) {
          if (!defs)
            return ;
          if (!ProtoBuf.Util.isArray(defs)) {
            defs = [defs];
          }
          if (defs.length == 0)
            return ;
          var stack = [],
              def,
              obj,
              subObj,
              i,
              j;
          stack.push(defs);
          while (stack.length > 0) {
            defs = stack.pop();
            if (ProtoBuf.Util.isArray(defs)) {
              while (defs.length > 0) {
                def = defs.shift();
                if (Builder.isValidMessage(def)) {
                  obj = new Reflect.Message(this.ptr, def["name"], def["options"]);
                  if (def["fields"] && def["fields"].length > 0) {
                    for (i = 0; i < def["fields"].length; i++) {
                      if (obj.hasChild(def['fields'][i]['id'])) {
                        throw (new Error("Duplicate field id in message " + obj.name + ": " + def['fields'][i]['id']));
                      }
                      if (def["fields"][i]["options"]) {
                        subObj = Object.keys(def["fields"][i]["options"]);
                        for (j = 0; j < subObj.length; j++) {
                          if (!Lang.OPTNAME.test(subObj[j])) {
                            throw (new Error("Illegal field option name in message " + obj.name + "#" + def["fields"][i]["name"] + ": " + subObj[j]));
                          }
                          if (typeof def["fields"][i]["options"][subObj[j]] !== 'string' && typeof def["fields"][i]["options"][subObj[j]] !== 'number' && typeof def["fields"][i]["options"][subObj[j]] !== 'boolean') {
                            throw (new Error("Illegal field option value in message " + obj.name + "#" + def["fields"][i]["name"] + "#" + subObj[j] + ": " + def["fields"][i]["options"][subObj[j]]));
                          }
                        }
                        subObj = null;
                      }
                      obj.addChild(new Reflect.Message.Field(obj, def["fields"][i]["rule"], def["fields"][i]["type"], def["fields"][i]["name"], def["fields"][i]["id"], def["fields"][i]["options"]));
                    }
                  }
                  subObj = [];
                  if (typeof def["enums"] !== 'undefined' && def['enums'].length > 0) {
                    for (i = 0; i < def["enums"].length; i++) {
                      subObj.push(def["enums"][i]);
                    }
                  }
                  if (def["messages"] && def["messages"].length > 0) {
                    for (i = 0; i < def["messages"].length; i++) {
                      subObj.push(def["messages"][i]);
                    }
                  }
                  if (def["extensions"]) {
                    obj.extensions = def["extensions"];
                    if (obj.extensions[0] < ProtoBuf.Lang.ID_MIN) {
                      obj.extensions[0] = ProtoBuf.Lang.ID_MIN;
                    }
                    if (obj.extensions[1] > ProtoBuf.Lang.ID_MAX) {
                      obj.extensions[1] = ProtoBuf.Lang.ID_MAX;
                    }
                  }
                  this.ptr.addChild(obj);
                  if (subObj.length > 0) {
                    stack.push(defs);
                    defs = subObj;
                    subObj = null;
                    this.ptr = obj;
                    obj = null;
                    continue;
                  }
                  subObj = null;
                  obj = null;
                } else if (Builder.isValidEnum(def)) {
                  obj = new Reflect.Enum(this.ptr, def["name"], def["options"]);
                  for (i = 0; i < def["values"].length; i++) {
                    obj.addChild(new Reflect.Enum.Value(obj, def["values"][i]["name"], def["values"][i]["id"]));
                  }
                  this.ptr.addChild(obj);
                  obj = null;
                } else if (Builder.isValidService(def)) {
                  obj = new Reflect.Service(this.ptr, def["name"], def["options"]);
                  for (i in def["rpc"]) {
                    if (def["rpc"].hasOwnProperty(i)) {
                      obj.addChild(new Reflect.Service.RPCMethod(obj, i, def["rpc"][i]["request"], def["rpc"][i]["response"], def["rpc"][i]["options"]));
                    }
                  }
                  this.ptr.addChild(obj);
                  obj = null;
                } else if (Builder.isValidExtend(def)) {
                  obj = this.ptr.resolve(def["ref"]);
                  if (obj) {
                    for (i = 0; i < def["fields"].length; i++) {
                      if (obj.hasChild(def['fields'][i]['id'])) {
                        throw (new Error("Duplicate extended field id in message " + obj.name + ": " + def['fields'][i]['id']));
                      }
                      if (def['fields'][i]['id'] < obj.extensions[0] || def['fields'][i]['id'] > obj.extensions[1]) {
                        throw (new Error("Illegal extended field id in message " + obj.name + ": " + def['fields'][i]['id'] + " (" + obj.extensions.join(' to ') + " expected)"));
                      }
                      obj.addChild(new Reflect.Message.Field(obj, def["fields"][i]["rule"], def["fields"][i]["type"], def["fields"][i]["name"], def["fields"][i]["id"], def["fields"][i]["options"]));
                    }
                  } else {
                    if (!/\.?google\.protobuf\./.test(def["ref"])) {
                      throw (new Error("Extended message " + def["ref"] + " is not defined"));
                    }
                  }
                } else {
                  throw (new Error("Not a valid message, enum, service or extend definition: " + JSON.stringify(def)));
                }
                def = null;
              }
            } else {
              throw (new Error("Not a valid namespace definition: " + JSON.stringify(defs)));
            }
            defs = null;
            this.ptr = this.ptr.parent;
          }
          this.resolved = false;
          this.result = null;
          return this;
        };
        Builder.isValidImport = function(filename) {
          return !(/google\/protobuf\//.test(filename));
        };
        Builder.prototype["import"] = function(json, filename) {
          if (typeof filename === 'string') {
            if (ProtoBuf.Util.IS_NODE) {
              var path = require("path");
              filename = path.resolve(filename);
            }
            if (!!this.files[filename]) {
              this.reset();
              return this;
            }
            this.files[filename] = true;
          }
          if (!!json['imports'] && json['imports'].length > 0) {
            var importRoot,
                delim = '/',
                resetRoot = false;
            if (typeof filename === 'object') {
              this.importRoot = filename["root"];
              resetRoot = true;
              importRoot = this.importRoot;
              filename = filename["file"];
              if (importRoot.indexOf("\\") >= 0 || filename.indexOf("\\") >= 0)
                delim = '\\';
            } else if (typeof filename === 'string') {
              if (this.importRoot) {
                importRoot = this.importRoot;
              } else {
                if (filename.indexOf("/") >= 0) {
                  importRoot = filename.replace(/\/[^\/]*$/, "");
                  if (importRoot === "")
                    importRoot = "/";
                } else if (filename.indexOf("\\") >= 0) {
                  importRoot = filename.replace(/\\[^\\]*$/, "");
                  delim = '\\';
                } else {
                  importRoot = ".";
                }
              }
            } else {
              importRoot = null;
            }
            for (var i = 0; i < json['imports'].length; i++) {
              if (typeof json['imports'][i] === 'string') {
                if (!importRoot) {
                  throw (new Error("Cannot determine import root: File name is unknown"));
                }
                var importFilename = importRoot + delim + json['imports'][i];
                if (!Builder.isValidImport(importFilename))
                  continue;
                if (/\.proto$/i.test(importFilename) && !ProtoBuf.DotProto) {
                  importFilename = importFilename.replace(/\.proto$/, ".json");
                }
                var contents = ProtoBuf.Util.fetch(importFilename);
                if (contents === null) {
                  throw (new Error("Failed to import '" + importFilename + "' in '" + filename + "': File not found"));
                }
                if (/\.json$/i.test(importFilename)) {
                  this["import"](JSON.parse(contents + ""), importFilename);
                } else {
                  this["import"]((new ProtoBuf.DotProto.Parser(contents + "")).parse(), importFilename);
                }
              } else {
                if (!filename) {
                  this["import"](json['imports'][i]);
                } else if (/\.(\w+)$/.test(filename)) {
                  this["import"](json['imports'][i], filename.replace(/^(.+)\.(\w+)$/, function($0, $1, $2) {
                    return $1 + "_import" + i + "." + $2;
                  }));
                } else {
                  this["import"](json['imports'][i], filename + "_import" + i);
                }
              }
            }
            if (resetRoot) {
              this.importRoot = null;
            }
          }
          if (!!json['messages']) {
            if (!!json['package'])
              this.define(json['package'], json["options"]);
            this.create(json['messages']);
            this.reset();
          }
          if (!!json['enums']) {
            if (!!json['package'])
              this.define(json['package'], json["options"]);
            this.create(json['enums']);
            this.reset();
          }
          if (!!json['services']) {
            if (!!json['package'])
              this.define(json['package'], json["options"]);
            this.create(json['services']);
            this.reset();
          }
          if (!!json['extends']) {
            if (!!json['package'])
              this.define(json['package'], json["options"]);
            this.create(json['extends']);
            this.reset();
          }
          return this;
        };
        Builder.isValidService = function(def) {
          if (typeof def["name"] !== 'string' || !Lang.NAME.test(def["name"]) || typeof def["rpc"] !== 'object') {
            return false;
          }
          return true;
        };
        Builder.isValidExtend = function(def) {
          if (typeof def["ref"] !== 'string' || !Lang.TYPEREF.test(def["name"])) {
            return false;
          }
          var i;
          if (typeof def["fields"] !== 'undefined') {
            if (!ProtoBuf.Util.isArray(def["fields"])) {
              return false;
            }
            var ids = [],
                id;
            for (i = 0; i < def["fields"].length; i++) {
              if (!Builder.isValidMessageField(def["fields"][i])) {
                return false;
              }
              id = parseInt(def["id"], 10);
              if (ids.indexOf(id) >= 0) {
                return false;
              }
              ids.push(id);
            }
            ids = null;
          }
          return true;
        };
        Builder.prototype.resolveAll = function() {
          var res;
          if (this.ptr == null || typeof this.ptr.type === 'object')
            return ;
          if (this.ptr instanceof Reflect.Namespace) {
            var children = this.ptr.getChildren();
            for (var i = 0; i < children.length; i++) {
              this.ptr = children[i];
              this.resolveAll();
            }
          } else if (this.ptr instanceof Reflect.Message.Field) {
            if (!Lang.TYPE.test(this.ptr.type)) {
              if (!Lang.TYPEREF.test(this.ptr.type)) {
                throw (new Error("Illegal type reference in " + this.ptr.toString(true) + ": " + this.ptr.type));
              }
              res = this.ptr.parent.resolve(this.ptr.type, true);
              if (!res) {
                throw (new Error("Unresolvable type reference in " + this.ptr.toString(true) + ": " + this.ptr.type));
              }
              this.ptr.resolvedType = res;
              if (res instanceof Reflect.Enum) {
                this.ptr.type = ProtoBuf.TYPES["enum"];
              } else if (res instanceof Reflect.Message) {
                this.ptr.type = ProtoBuf.TYPES["message"];
              } else {
                throw (new Error("Illegal type reference in " + this.ptr.toString(true) + ": " + this.ptr.type));
              }
            } else {
              this.ptr.type = ProtoBuf.TYPES[this.ptr.type];
            }
          } else if (this.ptr instanceof ProtoBuf.Reflect.Enum.Value) {} else if (this.ptr instanceof ProtoBuf.Reflect.Service.Method) {
            if (this.ptr instanceof ProtoBuf.Reflect.Service.RPCMethod) {
              res = this.ptr.parent.resolve(this.ptr.requestName);
              if (!res || !(res instanceof ProtoBuf.Reflect.Message)) {
                throw (new Error("Illegal request type reference in " + this.ptr.toString(true) + ": " + this.ptr.requestName));
              }
              this.ptr.resolvedRequestType = res;
              res = this.ptr.parent.resolve(this.ptr.responseName);
              if (!res || !(res instanceof ProtoBuf.Reflect.Message)) {
                throw (new Error("Illegal response type reference in " + this.ptr.toString(true) + ": " + this.ptr.responseName));
              }
              this.ptr.resolvedResponseType = res;
            } else {
              throw (new Error("Illegal service method type in " + this.ptr.toString(true)));
            }
          } else {
            throw (new Error("Illegal object type in namespace: " + typeof(this.ptr) + ":" + this.ptr));
          }
          this.reset();
        };
        Builder.prototype.build = function(path) {
          this.reset();
          if (!this.resolved) {
            this.resolveAll();
            this.resolved = true;
            this.result = null;
          }
          if (this.result == null) {
            this.result = this.ns.build();
          }
          if (!path) {
            return this.result;
          } else {
            var part = path.split(".");
            var ptr = this.result;
            for (var i = 0; i < part.length; i++) {
              if (ptr[part[i]]) {
                ptr = ptr[part[i]];
              } else {
                ptr = null;
                break;
              }
            }
            return ptr;
          }
        };
        Builder.prototype.lookup = function(path) {
          return path ? this.ns.resolve(path) : this.ns;
        };
        Builder.prototype.toString = function() {
          return "Builder";
        };
        Builder.Message = function() {};
        Builder.Service = function() {};
        return Builder;
      })(ProtoBuf, ProtoBuf.Lang, ProtoBuf.Reflect);
      ProtoBuf.loadProto = function(proto, builder, filename) {
        if (typeof builder == 'string' || (builder && typeof builder["file"] === 'string' && typeof builder["root"] === 'string')) {
          filename = builder;
          builder = null;
        }
        return ProtoBuf.loadJson((new ProtoBuf.DotProto.Parser(proto + "")).parse(), builder, filename);
      };
      ProtoBuf.protoFromString = ProtoBuf.loadProto;
      ProtoBuf.loadProtoFile = function(filename, callback, builder) {
        if (callback && typeof callback === 'object') {
          builder = callback;
          callback = null;
        } else if (!callback || typeof callback !== 'function') {
          callback = null;
        }
        if (callback) {
          ProtoBuf.Util.fetch(typeof filename === 'object' ? filename["root"] + "/" + filename["file"] : filename, function(contents) {
            callback(ProtoBuf.loadProto(contents, builder, filename));
          });
        } else {
          var contents = ProtoBuf.Util.fetch(typeof filename === 'object' ? filename["root"] + "/" + filename["file"] : filename);
          return contents !== null ? ProtoBuf.protoFromString(contents, builder, filename) : null;
        }
      };
      ProtoBuf.protoFromFile = ProtoBuf.loadProtoFile;
      ProtoBuf.newBuilder = function(pkg, options) {
        var builder = new ProtoBuf.Builder();
        if (typeof pkg !== 'undefined' && pkg !== null) {
          builder.define(pkg, options);
        }
        return builder;
      };
      ProtoBuf.loadJson = function(json, builder, filename) {
        if (typeof builder === 'string' || (builder && typeof builder["file"] === 'string' && typeof builder["root"] === 'string')) {
          filename = builder;
          builder = null;
        }
        if (!builder || typeof builder !== 'object')
          builder = ProtoBuf.newBuilder();
        if (typeof json === 'string')
          json = JSON.parse(json);
        builder["import"](json, filename);
        builder.resolveAll();
        builder.build();
        return builder;
      };
      ProtoBuf.loadJsonFile = function(filename, callback, builder) {
        if (callback && typeof callback === 'object') {
          builder = callback;
          callback = null;
        } else if (!callback || typeof callback !== 'function') {
          callback = null;
        }
        if (callback) {
          ProtoBuf.Util.fetch(typeof filename === 'object' ? filename["root"] + "/" + filename["file"] : filename, function(contents) {
            try {
              callback(ProtoBuf.loadJson(JSON.parse(contents), builder, filename));
            } catch (err) {
              callback(err);
            }
          });
        } else {
          var contents = ProtoBuf.Util.fetch(typeof filename === 'object' ? filename["root"] + "/" + filename["file"] : filename);
          return contents !== null ? ProtoBuf.loadJson(JSON.parse(contents), builder, filename) : null;
        }
      };
      return ProtoBuf;
    }
    if (typeof module != 'undefined' && module["exports"]) {
      module["exports"] = loadProtoBuf(require("bytebuffer"));
    } else if (typeof define != 'undefined' && define["amd"]) {
      define("ProtoBuf", ["ByteBuffer"], loadProtoBuf);
    } else {
      if (!global["dcodeIO"]) {
        global["dcodeIO"] = {};
      }
      global["dcodeIO"]["ProtoBuf"] = loadProtoBuf(global["dcodeIO"]["ByteBuffer"]);
    }
  })(this);
})(require("buffer").Buffer, require("process"));
