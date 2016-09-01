/* */ 
(function(process) {
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
        return;
      if (!ProtoBuf.Util.isArray(defs)) {
        defs = [defs];
      }
      if (defs.length == 0)
        return;
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
          var path = require('path');
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
        return;
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
})(require('process'));
