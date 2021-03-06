/* */ 
(function(Buffer) {
  function ByteBuffer(capacity, littleEndian, sparse) {}
  ;
  ByteBuffer.prototype.array;
  ByteBuffer.prototype.offset;
  ByteBuffer.prototype.markedOffset;
  ByteBuffer.prototype.length;
  ByteBuffer.prototype.littleEndian;
  ByteBuffer.VERSION;
  ByteBuffer.DEFAULT_CAPACITY = 32;
  ByteBuffer.LITTLE_ENDIAN = true;
  ByteBuffer.BIG_ENDIAN = false;
  ByteBuffer.allocate = function(capacity, littleEndian) {};
  ByteBuffer.wrap = function(buffer, enc, littleEndian) {};
  ByteBuffer.isByteBuffer = function(bb) {};
  ByteBuffer.prototype.LE = function(littleEndian) {};
  ByteBuffer.prototype.BE = function(bigEndian) {};
  ByteBuffer.prototype.resize = function(capacity) {};
  ByteBuffer.prototype.slice = function(begin, end) {};
  ByteBuffer.prototype.sliceAndCompact = function(begin, end) {};
  ByteBuffer.prototype.ensureCapacity = function(capacity) {};
  ByteBuffer.prototype.flip = function() {};
  ByteBuffer.prototype.mark = function(offset) {};
  ByteBuffer.prototype.reset = function() {};
  ByteBuffer.prototype.clone = function() {};
  ByteBuffer.prototype.copy = function() {};
  ByteBuffer.prototype.remaining = function() {};
  ByteBuffer.prototype.capacity = function() {};
  ByteBuffer.prototype.compact = function() {};
  ByteBuffer.prototype.destroy = function() {};
  ByteBuffer.prototype.reverse = function() {};
  ByteBuffer.prototype.append = function(src, offset) {};
  ByteBuffer.prototype.prepend = function(src, offset) {};
  ByteBuffer.prototype.writeInt8 = function(value, offset) {};
  ByteBuffer.prototype.readInt8 = function(offset) {};
  ByteBuffer.prototype.writeByte = function(value, offset) {};
  ByteBuffer.prototype.readByte = function(offset) {};
  ByteBuffer.prototype.writeUint8 = function(value, offset) {};
  ByteBuffer.prototype.readUint8 = function(offset) {};
  ByteBuffer.prototype.writeInt16 = function(value, offset) {};
  ByteBuffer.prototype.readInt16 = function(offset) {};
  ByteBuffer.prototype.writeShort = function(value, offset) {};
  ByteBuffer.prototype.readShort = function(offset) {};
  ByteBuffer.prototype.writeUint16 = function(value, offset) {};
  ByteBuffer.prototype.readUint16 = function(offset) {};
  ByteBuffer.prototype.writeInt32 = function(value, offset) {};
  ByteBuffer.prototype.readInt32 = function(offset) {};
  ByteBuffer.prototype.writeInt = function(value, offset) {};
  ByteBuffer.prototype.readInt = function(offset) {};
  ByteBuffer.prototype.writeUint32 = function(value, offset) {};
  ByteBuffer.prototype.readUint32 = function(offset) {};
  ByteBuffer.prototype.writeInt64 = function(value, offset) {};
  ByteBuffer.prototype.readInt64 = function(offset) {};
  ByteBuffer.prototype.writeUint64 = function(value, offset) {};
  ByteBuffer.prototype.readUint64 = function(offset) {};
  ByteBuffer.prototype.writeFloat32 = function(value, offset) {};
  ByteBuffer.prototype.readFloat32 = function(offset) {};
  ByteBuffer.prototype.writeFloat = function(value, offset) {};
  ByteBuffer.prototype.readFloat = function(offset) {};
  ByteBuffer.prototype.writeFloat64 = function(value, offset) {};
  ByteBuffer.prototype.readFloat64 = function(offset) {};
  ByteBuffer.prototype.writeDouble = function(value, offset) {};
  ByteBuffer.prototype.readDouble = function(offset) {};
  ByteBuffer.prototype.writeLong = function(value, offset) {};
  ByteBuffer.prototype.readLong = function(offset) {};
  ByteBuffer.prototype.writeVarint32 = function(value, offset) {};
  ByteBuffer.prototype.readVarint32 = function(offset) {};
  ByteBuffer.prototype.writeZigZagVarint32 = function(value, offset) {};
  ByteBuffer.prototype.readZigZagVarint32 = function(offset) {};
  ByteBuffer.prototype.writeVarint64 = function(value, offset) {};
  ByteBuffer.prototype.readVarint64 = function(offset) {};
  ByteBuffer.prototype.writeZigZagVarint64 = function(value, offset) {};
  ByteBuffer.prototype.readZigZagVarint64 = function(offset) {};
  ByteBuffer.prototype.writeVarint = function(value, offset) {};
  ByteBuffer.prototype.readVarint = function(offset) {};
  ByteBuffer.prototype.writeZigZagVarint = function(value, offset) {};
  ByteBuffer.prototype.readZigZagVarint = function(offset) {};
  ByteBuffer.calculateVarint32 = function(value) {};
  ByteBuffer.calculateVarint64 = function(value) {};
  ByteBuffer.calculateUTF8String = function(str) {};
  ByteBuffer.prototype.writeUTF8String = function(str, offset) {};
  ByteBuffer.prototype.readUTF8String = function(chars, offset) {};
  ByteBuffer.prototype.readUTF8StringBytes = function(length, offset) {};
  ByteBuffer.prototype.writeLString = function(str, offset) {};
  ByteBuffer.prototype.readLString = function(offset) {};
  ByteBuffer.prototype.writeVString = function(str, offset) {};
  ByteBuffer.prototype.readVString = function(offset) {};
  ByteBuffer.prototype.writeCString = function(str, offset) {};
  ByteBuffer.prototype.readCString = function(offset) {};
  ByteBuffer.prototype.writeJSON = function(data, offset, stringify) {};
  ByteBuffer.prototype.readJSON = function(offset, parse) {};
  ByteBuffer.prototype.toColumns = function(wrap) {};
  ByteBuffer.prototype.printDebug = function(out) {};
  ByteBuffer.prototype.toHex = function(debug) {};
  ByteBuffer.prototype.toBinary = function() {};
  ByteBuffer.prototype.toUTF8 = function() {};
  ByteBuffer.prototype.toBase64 = function() {};
  ByteBuffer.prototype.toString = function(enc) {};
  ByteBuffer.prototype.toArrayBuffer = function(forceCopy) {};
  ByteBuffer.decodeUTF8Char = function(src, offset) {};
  ByteBuffer.encodeUTF8Char = function(charCode, dst, offset) {};
  ByteBuffer.calculateUTF8Char = function(charCode) {};
  ByteBuffer.zigZagEncode32 = function(n) {};
  ByteBuffer.zigZagDecode32 = function(n) {};
  ByteBuffer.encode64 = function(bb) {};
  ByteBuffer.decode64 = function(str, littleEndian) {};
  ByteBuffer.encodeHex = function(bb) {};
  ByteBuffer.decodeHex = function(str, littleEndian) {};
  ByteBuffer.encodeBinary = function(bb) {};
  ByteBuffer.decodeBinary = function(str, littleEndian) {};
  ByteBuffer.MAX_VARINT32_BYTES = 5;
  ByteBuffer.MAX_VARINT64_BYTES = 10;
})(require("buffer").Buffer);
