/* */ 
(function(Buffer) {
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
        return;
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
                    return;
                  }
                  try {
                    res = method.resolvedResponseType.clazz.decode(res);
                  } catch (notABuffer) {}
                  if (!res || !(res instanceof method.resolvedResponseType.clazz)) {
                    callback(new Error("Illegal response type received in service method " + T.name + "#" + method.name));
                    return;
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
})(require('buffer').Buffer);
