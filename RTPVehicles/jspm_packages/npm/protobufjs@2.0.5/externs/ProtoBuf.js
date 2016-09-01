/* */ 
(function(Buffer) {
  var ProtoBuf = {};
  ProtoBuf.VERSION = "0.9.2";
  ProtoBuf.WIRE_TYPES = {};
  ProtoBuf.WIRE_TYPES.VARINT = 0;
  ProtoBuf.WIRE_TYPES.BITS64 = 1;
  ProtoBuf.WIRE_TYPES.LDELIM = 2;
  ProtoBuf.WIRE_TYPES.STARTGROUP = 3;
  ProtoBuf.WIRE_TYPES.ENDGROUP = 4;
  ProtoBuf.WIRE_TYPES.BITS32 = 5;
  ProtoBuf.convertFieldsToCamelCase = false;
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
  ProtoBuf.Lang = {};
  ProtoBuf.DotProto = {};
  ProtoBuf.DotProto.Tokenizer = function(proto) {};
  ProtoBuf.DotProto.Tokenizer.prototype.source;
  ProtoBuf.DotProto.Tokenizer.prototype.index;
  ProtoBuf.DotProto.Tokenizer.prototype.line;
  ProtoBuf.DotProto.Tokenizer.prototype.stack;
  ProtoBuf.DotProto.Tokenizer.prototype.readingString;
  ProtoBuf.DotProto.Tokenizer.prototype.next = function() {};
  ProtoBuf.DotProto.Tokenizer.prototype.peek = function() {};
  ProtoBuf.DotProto.Tokenizer.prototype.toString = function() {};
  ProtoBuf.DotProto.Parser = function(proto) {};
  ProtoBuf.DotProto.Parser.prototype.tn;
  ProtoBuf.DotProto.Parser.prototype.parse = function() {};
  ProtoBuf.DotProto.Parser.prototype.toString = function() {};
  ProtoBuf.Reflect.Reflect = {};
  ProtoBuf.Reflect.T = function(parent, name) {};
  ProtoBuf.Reflect.T.prototype.parent;
  ProtoBuf.Reflect.T.prototype.name;
  ProtoBuf.Reflect.T.prototype.fqn = function() {};
  ProtoBuf.Reflect.T.prototype.toString = function(includeClass) {};
  ProtoBuf.Reflect.T.prototype.build = function() {};
  ProtoBuf.Reflect.Namespace = function(parent, name) {};
  ProtoBuf.Reflect.Namespace.prototype.children;
  ProtoBuf.Reflect.Namespace.prototype.getChildren = function(type) {};
  ProtoBuf.Reflect.Namespace.prototype.addChild = function(child) {};
  ProtoBuf.Reflect.Namespace.prototype.hasChild = function(nameOrId) {};
  ProtoBuf.Reflect.Namespace.prototype.getChild = function(nameOrId) {};
  ProtoBuf.Reflect.Namespace.prototype.resolve = function(qn, excludeFields) {};
  ProtoBuf.Reflect.Namespace.prototype.build = function() {};
  ProtoBuf.Reflect.Message = function(parent, name) {};
  ProtoBuf.Reflect.Message.prototype.extensions;
  ProtoBuf.Reflect.Message.prototype.clazz;
  ProtoBuf.Reflect.Message.prototype.build = function() {};
  ProtoBuf.Reflect.Message.prototype.encode = function(message, buffer) {};
  ProtoBuf.Reflect.Message.prototype.decode = function(buffer, length) {};
  ProtoBuf.Reflect.Message.Field = function(message, rule, type, name, id, options) {};
  ProtoBuf.Reflect.Message.Field.prototype.required;
  ProtoBuf.Reflect.Message.Field.prototype.repeated;
  ProtoBuf.Reflect.Message.Field.prototype.type;
  ProtoBuf.Reflect.Message.Field.prototype.id;
  ProtoBuf.Reflect.Message.Field.prototype.options;
  ProtoBuf.Reflect.Message.Field.prototype.resolvedType;
  ProtoBuf.Reflect.Message.Field.prototype.originalName;
  ProtoBuf.Reflect.Message.Field.prototype.verifyValue = function(value, skipRepeated) {};
  ProtoBuf.Reflect.Message.Field.prototype.encode = function(value, buffer) {};
  ProtoBuf.Reflect.Message.Field.prototype.decode = function(wireType, buffer) {};
  ProtoBuf.Reflect.Message.Field.prototype.encodeValue = function(value, buffer) {};
  ProtoBuf.Reflect.Enum = function(parent, name) {};
  ProtoBuf.Reflect.Enum.prototype.build = function() {};
  ProtoBuf.Reflect.Enum.prototype.object;
  ProtoBuf.Reflect.Enum.Value = function(enm, name, id) {};
  ProtoBuf.Reflect.Enum.Value.prototype.id;
  ProtoBuf.Reflect.Service = function(root, name, options) {};
  ProtoBuf.Reflect.Service.prototype.clazz;
  ProtoBuf.Reflect.Service.prototype.build = function() {};
  ProtoBuf.Reflect.Service.Method = function(svc, name, options) {};
  ProtoBuf.Reflect.Service.Method.prototype.buildOpt = function() {};
  ProtoBuf.Reflect.Service.RPCMethod = function(svc, name, request, response, options) {};
  ProtoBuf.Reflect.Service.RPCMethod.prototype.requestName;
  ProtoBuf.Reflect.Service.RPCMethod.prototype.responseName;
  ProtoBuf.Reflect.Service.RPCMethod.prototype.resolvedRequestType;
  ProtoBuf.Reflect.Service.RPCMethod.prototype.resolvedResponseType;
  ProtoBuf.Builder = function() {};
  ProtoBuf.Builder.prototype.ns;
  ProtoBuf.Builder.prototype.ptr;
  ProtoBuf.Builder.prototype.resolved;
  ProtoBuf.Builder.prototype.result;
  ProtoBuf.Builder.prototype.files;
  ProtoBuf.Builder.prototype.importRoot;
  ProtoBuf.Builder.prototype.reset = function() {};
  ProtoBuf.Builder.prototype.define = function(pkg) {};
  ProtoBuf.Builder.isValidMessage = function(def) {};
  ProtoBuf.Builder.isValidMessageField = function(def) {};
  ProtoBuf.Builder.isValidEnum = function(def) {};
  ProtoBuf.Builder.isValidService = function(def) {};
  ProtoBuf.Builder.isValidExtend = function(def) {};
  ProtoBuf.Builder.prototype.create = function(messages) {};
  ProtoBuf.Builder.prototype["import"] = function(builder, filename) {};
  ProtoBuf.Builder.prototype.resolveAll = function() {};
  ProtoBuf.Builder.prototype.build = function(path) {};
  ProtoBuf.Builder.prototype.lookup = function(path) {};
  ProtoBuf.Builder.prototype.toString = function() {};
  ProtoBuf.Builder.Message = function(values) {};
  ProtoBuf.Builder.Message.prototype.add = function(key, value) {};
  ProtoBuf.Builder.Message.prototype.set = function(key, value) {};
  ProtoBuf.Builder.Message.prototype.get = function(key) {};
  ProtoBuf.Builder.Message.prototype.encode = function(buffer) {};
  ProtoBuf.Builder.Message.prototype.encodeAB = function() {};
  ProtoBuf.Builder.Message.prototype.toArrayBuffer = function() {};
  ProtoBuf.Builder.Message.prototype.encodeNB = function() {};
  ProtoBuf.Builder.Message.prototype.toBuffer = function() {};
  ProtoBuf.Builder.Message.prototype.encode64 = function() {};
  ProtoBuf.Builder.Message.prototype.toBase64 = function() {};
  ProtoBuf.Builder.Message.prototype.encodeHex = function() {};
  ProtoBuf.Builder.Message.prototype.toHex = function() {};
  ProtoBuf.Builder.Message.decode = function(buffer, enc) {};
  ProtoBuf.Builder.Message.decode64 = function(str) {};
  ProtoBuf.Builder.Message.decodeHex = function(str) {};
  ProtoBuf.Builder.Message.prototype.toString = function() {};
  ProtoBuf.Builder.Service = function(rpcImpl) {};
  ProtoBuf.Builder.prototype.rpcImpl;
  ProtoBuf.loadProto = function(proto, builder, filename) {};
  ProtoBuf.protoFromString = function(proto, builder, filename) {};
  ProtoBuf.loadProtoFile = function(filename, callback, builder) {};
  ProtoBuf.protoFromFile = function(filename, callback, builder) {};
  ProtoBuf.loadJson = function(json, builder, filename) {};
  ProtoBuf.loadJsonFile = function(filename, callback, builder) {};
  ProtoBuf.newBuilder = function(pkg) {};
  ProtoBuf.Util = {};
  ProtoBuf.Util.IS_NODE;
  ProtoBuf.Util.XHR = function() {};
  ProtoBuf.Util.fetch = function(path, callback) {};
  ProtoBuf.Util.isArray = function(obj) {};
})(require('buffer').Buffer);
