/* */ 
"format cjs";
(function(Buffer) {
  (function(global) {
    "use strict";
    function loadByteBuffer(Long) {
      var Buffer = null;
      if (typeof require === 'function') {
        try {
          var nodeBuffer = require('buffer');
          Buffer = nodeBuffer && typeof nodeBuffer['Buffer'] === 'function' && typeof nodeBuffer['Buffer']['isBuffer'] === 'function' ? nodeBuffer['Buffer'] : null;
        } catch (e) {}
      }
      var ByteBuffer = function(capacity, littleEndian, sparse) {
        capacity = typeof capacity !== 'undefined' ? parseInt(capacity, 10) : ByteBuffer.DEFAULT_CAPACITY;
        if (capacity < 1)
          capacity = ByteBuffer.DEFAULT_CAPACITY;
        this.array = sparse ? null : new ArrayBuffer(capacity);
        this.view = sparse ? null : new DataView(this.array);
        this.offset = 0;
        this.markedOffset = -1;
        this.length = 0;
        this.littleEndian = typeof littleEndian != 'undefined' ? !!littleEndian : false;
      };
      ByteBuffer.VERSION = ByteBuffer.DEFAULT_CAPACITY = 16;
      ByteBuffer.LITTLE_ENDIAN = true;
      ByteBuffer.BIG_ENDIAN = false;
      ByteBuffer.Long = Long || null;
      ByteBuffer.isByteBuffer = function(bb) {
        return bb && ((bb instanceof ByteBuffer) || (typeof bb === 'object' && (bb.array === null || bb.array instanceof ArrayBuffer) && (bb.view === null || bb.view instanceof DataView) && typeof bb.offset === 'number' && typeof bb.markedOffset === 'number' && typeof bb.length === 'number' && typeof bb.littleEndian === 'boolean'));
      };
      ByteBuffer.allocate = function(capacity, littleEndian) {
        return new ByteBuffer(capacity, littleEndian);
      };
      function b2ab(b) {
        var ab = new ArrayBuffer(b.length),
            view = new Uint8Array(ab);
        for (var i = 0,
            k = b.length; i < k; ++i)
          view[i] = b[i];
        return ab;
      }
      ByteBuffer.wrap = function(buffer, enc, littleEndian) {
        if (typeof enc === 'boolean') {
          littleEndian = enc;
          enc = "utf8";
        }
        if (typeof buffer === 'string') {
          switch (enc) {
            case "base64":
              return ByteBuffer.decode64(buffer, littleEndian);
            case "hex":
              return ByteBuffer.decodeHex(buffer, littleEndian);
            case "binary":
              return ByteBuffer.decodeBinary(buffer, littleEndian);
            default:
              return new ByteBuffer(ByteBuffer.DEFAULT_CAPACITY, littleEndian).writeUTF8String(buffer).flip();
          }
        }
        var b;
        if (Buffer && Buffer.isBuffer(buffer)) {
          b = new Uint8Array(buffer).buffer;
          buffer = (b === buffer) ? b2ab(buffer) : b;
        }
        if (buffer === null || typeof buffer !== 'object') {
          throw (new Error("Cannot wrap null or non-object"));
        }
        if (ByteBuffer.isByteBuffer(buffer)) {
          return ByteBuffer.prototype.clone.call(buffer);
        }
        if (!!buffer["array"]) {
          buffer = buffer["array"];
        } else if (!!buffer["buffer"]) {
          buffer = buffer["buffer"];
        }
        if (!(buffer instanceof ArrayBuffer)) {
          throw (new Error("Cannot wrap buffer of type " + typeof(buffer) + ", " + buffer.constructor.name));
        }
        b = new ByteBuffer(0, littleEndian, true);
        b.array = buffer;
        b.view = b.array.byteLength > 0 ? new DataView(b.array) : null;
        b.offset = 0;
        b.length = buffer.byteLength;
        return b;
      };
      ByteBuffer.prototype.LE = function(littleEndian) {
        this.littleEndian = typeof littleEndian !== 'undefined' ? !!littleEndian : true;
        return this;
      };
      ByteBuffer.prototype.BE = function(bigEndian) {
        this.littleEndian = typeof bigEndian !== 'undefined' ? !bigEndian : false;
        return this;
      };
      ByteBuffer.prototype.resize = function(capacity) {
        if (capacity < 1)
          return false;
        if (this.array === null) {
          this.array = new ArrayBuffer(capacity);
          this.view = new DataView(this.array);
        }
        if (this.array.byteLength < capacity) {
          var src = this.array;
          var srcView = new Uint8Array(src);
          var dst = new ArrayBuffer(capacity);
          var dstView = new Uint8Array(dst);
          dstView.set(srcView);
          this.array = dst;
          this.view = new DataView(dst);
        }
        return this;
      };
      ByteBuffer.prototype.slice = function(begin, end) {
        if (this.array == null) {
          throw (new Error(this + " cannot be sliced: Already destroyed"));
        }
        if (typeof begin === 'undefined')
          begin = this.offset;
        if (typeof end === 'undefined')
          end = this.length;
        if (end <= begin) {
          var t = end;
          end = begin;
          begin = t;
        }
        if (begin < 0 || begin > this.array.byteLength || end < 1 || end > this.array.byteLength) {
          throw (new Error(this + " cannot be sliced: Index out of bounds (0-" + this.array.byteLength + " -> " + begin + "-" + end + ")"));
        }
        var b = this.clone();
        b.offset = begin;
        b.length = end;
        return b;
      };
      ByteBuffer.prototype.ensureCapacity = function(capacity) {
        if (this.array === null)
          return this.resize(capacity);
        if (this.array.byteLength < capacity)
          return this.resize(this.array.byteLength * 2 >= capacity ? this.array.byteLength * 2 : capacity);
        return this;
      };
      ByteBuffer.prototype.flip = function() {
        this.length = this.array == null ? 0 : this.offset;
        this.offset = 0;
        return this;
      };
      ByteBuffer.prototype.mark = function(offset) {
        if (this.array == null) {
          throw (new Error(this + " cannot be marked: Already destroyed"));
        }
        offset = typeof offset !== 'undefined' ? parseInt(offset, 10) : this.offset;
        if (offset < 0 || offset > this.array.byteLength) {
          throw (new Error(this + " cannot be marked: Offset to mark is less than 0 or bigger than the capacity (" + this.array.byteLength + "): " + offset));
        }
        this.markedOffset = offset;
        return this;
      };
      ByteBuffer.prototype.reset = function() {
        if (this.array === null) {
          throw (new Error(this + " cannot be reset: Already destroyed"));
        }
        if (this.markedOffset >= 0) {
          this.offset = this.markedOffset;
          this.markedOffset = -1;
        } else {
          this.offset = 0;
          this.length = 0;
        }
        return this;
      };
      ByteBuffer.prototype.clone = function() {
        var b = new ByteBuffer(-1, this.littleEndian, true);
        b.array = this.array;
        b.view = this.view;
        b.offset = this.offset;
        b.markedOffset = this.markedOffset;
        b.length = this.length;
        return b;
      };
      ByteBuffer.prototype.copy = function() {
        if (this.array == null) {
          return this.clone();
        }
        var b = new ByteBuffer(this.array.byteLength, this.littleEndian);
        var src = new Uint8Array(this.array);
        var dst = new Uint8Array(b.array);
        dst.set(src);
        b.offset = this.offset;
        b.markedOffset = this.markedOffset;
        b.length = this.length;
        return b;
      };
      ByteBuffer.prototype.remaining = function() {
        if (this.array === null)
          return 0;
        return this.length - this.offset;
      };
      ByteBuffer.prototype.capacity = function() {
        return this.array != null ? this.array.byteLength : 0;
      };
      ByteBuffer.prototype.compact = function() {
        if (this.array == null) {
          throw (new Error(this + " cannot be compacted: Already destroyed"));
        }
        if (this.offset > this.length) {
          this.flip();
        }
        if (this.offset === this.length) {
          this.array = new ArrayBuffer(0);
          this.view = null;
          return this;
        }
        if (this.offset === 0 && this.length === this.array.byteLength) {
          return this;
        }
        var srcView = new Uint8Array(this.array);
        var dst = new ArrayBuffer(this.length - this.offset);
        var dstView = new Uint8Array(dst);
        dstView.set(srcView.subarray(this.offset, this.length));
        this.array = dst;
        if (this.markedOffset >= this.offset) {
          this.markedOffset -= this.offset;
        } else {
          this.markedOffset = -1;
        }
        this.offset = 0;
        this.length = this.array.byteLength;
        return this;
      };
      ByteBuffer.prototype.destroy = function() {
        if (this.array !== null) {
          this.array = null;
          this.view = null;
          this.offset = 0;
          this.markedOffset = -1;
          this.length = 0;
        }
        return this;
      };
      ByteBuffer.prototype.reverse = function() {
        if (this.array === null) {
          throw (new Error(this + " cannot be reversed: Already destroyed"));
        }
        Array.prototype.reverse.call(new Uint8Array(this.array));
        var o = this.offset;
        this.offset = this.array.byteLength - this.length;
        this.markedOffset = -1;
        this.length = this.array.byteLength - o;
        this.view = new DataView(this.array);
        return this;
      };
      ByteBuffer.prototype.append = function(src, offset) {
        if (!(src instanceof ByteBuffer)) {
          src = ByteBuffer.wrap(src);
        }
        if (src.array === null) {
          throw (new Error(src + " cannot be appended to " + this + ": Already destroyed"));
        }
        var n = src.length - src.offset;
        if (n == 0)
          return this;
        if (n < 0) {
          src = src.clone().flip();
          n = src.length - src.offset;
        }
        offset = typeof offset !== 'undefined' ? offset : (this.offset += n) - n;
        this.ensureCapacity(offset + n);
        var srcView = new Uint8Array(src.array);
        var dstView = new Uint8Array(this.array);
        dstView.set(srcView.subarray(src.offset, src.length), offset);
        return this;
      };
      ByteBuffer.prototype.prepend = function(src, offset) {
        if (!(src instanceof ByteBuffer)) {
          src = ByteBuffer.wrap(src);
        }
        if (src.array === null) {
          throw (src + " cannot be prepended to " + this + ": Already destroyed");
        }
        var n = src.length - src.offset;
        if (n == 0)
          return this;
        if (n < 0) {
          src = src.clone().flip();
          n = src.length - src.offset;
        }
        var modify = typeof offset === 'undefined';
        offset = typeof offset !== 'undefined' ? offset : this.offset;
        var diff = n - offset;
        if (diff > 0) {
          this.ensureCapacity(this.length + diff);
          this.append(this, n);
          this.offset += diff;
          this.length += diff;
          this.append(src, 0);
        } else {
          this.append(src, offset - n);
        }
        if (modify) {
          this.offset -= n;
        }
        return this;
      };
      ByteBuffer.prototype.writeInt8 = function(value, offset) {
        offset = typeof offset != 'undefined' ? offset : (this.offset += 1) - 1;
        this.ensureCapacity(offset + 1);
        this.view.setInt8(offset, value);
        return this;
      };
      ByteBuffer.prototype.readInt8 = function(offset) {
        offset = typeof offset !== 'undefined' ? offset : (this.offset += 1) - 1;
        if (offset >= this.array.byteLength) {
          throw (new Error("Cannot read int8 from " + this + " at " + offset + ": Capacity overflow"));
        }
        return this.view.getInt8(offset);
      };
      ByteBuffer.prototype.writeByte = ByteBuffer.prototype.writeInt8;
      ByteBuffer.prototype.readByte = ByteBuffer.prototype.readInt8;
      ByteBuffer.prototype.writeUint8 = function(value, offset) {
        offset = typeof offset !== 'undefined' ? offset : (this.offset += 1) - 1;
        this.ensureCapacity(offset + 1);
        this.view.setUint8(offset, value);
        return this;
      };
      ByteBuffer.prototype.readUint8 = function(offset) {
        offset = typeof offset !== 'undefined' ? offset : (this.offset += 1) - 1;
        if (offset + 1 > this.array.byteLength) {
          throw (new Error("Cannot read uint8 from " + this + " at " + offset + ": Capacity overflow"));
        }
        return this.view.getUint8(offset);
      };
      ByteBuffer.prototype.writeInt16 = function(value, offset) {
        offset = typeof offset !== 'undefined' ? offset : (this.offset += 2) - 2;
        this.ensureCapacity(offset + 2);
        this.view.setInt16(offset, value, this.littleEndian);
        return this;
      };
      ByteBuffer.prototype.readInt16 = function(offset) {
        offset = typeof offset !== 'undefined' ? offset : (this.offset += 2) - 2;
        if (offset + 2 > this.array.byteLength) {
          throw (new Error("Cannot read int16 from " + this + " at " + offset + ": Capacity overflow"));
        }
        return this.view.getInt16(offset, this.littleEndian);
      };
      ByteBuffer.prototype.writeShort = ByteBuffer.prototype.writeInt16;
      ByteBuffer.prototype.readShort = ByteBuffer.prototype.readInt16;
      ByteBuffer.prototype.writeUint16 = function(value, offset) {
        offset = typeof offset !== 'undefined' ? offset : (this.offset += 2) - 2;
        this.ensureCapacity(offset + 2);
        this.view.setUint16(offset, value, this.littleEndian);
        return this;
      };
      ByteBuffer.prototype.readUint16 = function(offset) {
        offset = typeof offset !== 'undefined' ? offset : (this.offset += 2) - 2;
        if (offset + 2 > this.array.byteLength) {
          throw (new Error("Cannot read int16 from " + this + " at " + offset + ": Capacity overflow"));
        }
        return this.view.getUint16(offset, this.littleEndian);
      };
      ByteBuffer.prototype.writeInt32 = function(value, offset) {
        offset = typeof offset !== 'undefined' ? offset : (this.offset += 4) - 4;
        this.ensureCapacity(offset + 4);
        this.view.setInt32(offset, value, this.littleEndian);
        return this;
      };
      ByteBuffer.prototype.readInt32 = function(offset) {
        offset = typeof offset !== 'undefined' ? offset : (this.offset += 4) - 4;
        if (offset + 4 > this.array.byteLength) {
          throw (new Error("Cannot read int32 from " + this + " at " + offset + ": Capacity overflow"));
        }
        return this.view.getInt32(offset, this.littleEndian);
      };
      ByteBuffer.prototype.writeInt = ByteBuffer.prototype.writeInt32;
      ByteBuffer.prototype.readInt = ByteBuffer.prototype.readInt32;
      ByteBuffer.prototype.writeUint32 = function(value, offset) {
        offset = typeof offset != 'undefined' ? offset : (this.offset += 4) - 4;
        this.ensureCapacity(offset + 4);
        this.view.setUint32(offset, value, this.littleEndian);
        return this;
      };
      ByteBuffer.prototype.readUint32 = function(offset) {
        offset = typeof offset !== 'undefined' ? offset : (this.offset += 4) - 4;
        if (offset + 4 > this.array.byteLength) {
          throw (new Error("Cannot read uint32 from " + this + " at " + offset + ": Capacity overflow"));
        }
        return this.view.getUint32(offset, this.littleEndian);
      };
      ByteBuffer.prototype.writeFloat32 = function(value, offset) {
        offset = typeof offset !== 'undefined' ? offset : (this.offset += 4) - 4;
        this.ensureCapacity(offset + 4);
        this.view.setFloat32(offset, value, this.littleEndian);
        return this;
      };
      ByteBuffer.prototype.readFloat32 = function(offset) {
        offset = typeof offset !== 'undefined' ? offset : (this.offset += 4) - 4;
        if (this.array === null || offset + 4 > this.array.byteLength) {
          throw (new Error("Cannot read float32 from " + this + " at " + offset + ": Capacity overflow"));
        }
        return this.view.getFloat32(offset, this.littleEndian);
      };
      ByteBuffer.prototype.writeFloat = ByteBuffer.prototype.writeFloat32;
      ByteBuffer.prototype.readFloat = ByteBuffer.prototype.readFloat32;
      ByteBuffer.prototype.writeFloat64 = function(value, offset) {
        offset = typeof offset !== 'undefined' ? offset : (this.offset += 8) - 8;
        this.ensureCapacity(offset + 8);
        this.view.setFloat64(offset, value, this.littleEndian);
        return this;
      };
      ByteBuffer.prototype.readFloat64 = function(offset) {
        offset = typeof offset !== 'undefined' ? offset : (this.offset += 8) - 8;
        if (this.array === null || offset + 8 > this.array.byteLength) {
          throw (new Error("Cannot read float64 from " + this + " at " + offset + ": Capacity overflow"));
        }
        return this.view.getFloat64(offset, this.littleEndian);
      };
      ByteBuffer.prototype.writeDouble = ByteBuffer.prototype.writeFloat64;
      ByteBuffer.prototype.readDouble = ByteBuffer.prototype.readFloat64;
      if (Long) {
        ByteBuffer.prototype.writeInt64 = function(value, offset) {
          offset = typeof offset !== 'undefined' ? offset : (this.offset += 8) - 8;
          if (!(typeof value === 'object' && value instanceof Long))
            value = Long.fromNumber(value, false);
          this.ensureCapacity(offset + 8);
          if (this.littleEndian) {
            this.view.setInt32(offset, value.getLowBits(), true);
            this.view.setInt32(offset + 4, value.getHighBits(), true);
          } else {
            this.view.setInt32(offset, value.getHighBits(), false);
            this.view.setInt32(offset + 4, value.getLowBits(), false);
          }
          return this;
        };
        ByteBuffer.prototype.readInt64 = function(offset) {
          offset = typeof offset !== 'undefined' ? offset : (this.offset += 8) - 8;
          if (this.array === null || offset + 8 > this.array.byteLength) {
            this.offset -= 8;
            throw (new Error("Cannot read int64 from " + this + " at " + offset + ": Capacity overflow"));
          }
          var value;
          if (this.littleEndian) {
            value = Long.fromBits(this.view.getInt32(offset, true), this.view.getInt32(offset + 4, true), false);
          } else {
            value = Long.fromBits(this.view.getInt32(offset + 4, false), this.view.getInt32(offset, false), false);
          }
          return value;
        };
        ByteBuffer.prototype.writeUint64 = function(value, offset) {
          offset = typeof offset !== 'undefined' ? offset : (this.offset += 8) - 8;
          if (!(typeof value === 'object' && value instanceof Long))
            value = Long.fromNumber(value, true);
          this.ensureCapacity(offset + 8);
          if (this.littleEndian) {
            this.view.setUint32(offset, value.getLowBitsUnsigned(), true);
            this.view.setUint32(offset + 4, value.getHighBitsUnsigned(), true);
          } else {
            this.view.setUint32(offset, value.getHighBitsUnsigned(), false);
            this.view.setUint32(offset + 4, value.getLowBitsUnsigned(), false);
          }
          return this;
        };
        ByteBuffer.prototype.readUint64 = function(offset) {
          offset = typeof offset !== 'undefined' ? offset : (this.offset += 8) - 8;
          if (this.array === null || offset + 8 > this.array.byteLength) {
            this.offset -= 8;
            throw (new Error("Cannot read int64 from " + this + " at " + offset + ": Capacity overflow"));
          }
          var value;
          if (this.littleEndian) {
            value = Long.fromBits(this.view.getUint32(offset, true), this.view.getUint32(offset + 4, true), true);
          } else {
            value = Long.fromBits(this.view.getUint32(offset + 4, false), this.view.getUint32(offset, false), true);
          }
          return value;
        };
        ByteBuffer.prototype.writeLong = ByteBuffer.prototype.writeInt64;
        ByteBuffer.prototype.readLong = ByteBuffer.prototype.readInt64;
      }
      ByteBuffer.MAX_VARINT32_BYTES = 5;
      ByteBuffer.prototype.writeVarint32 = function(value, offset) {
        var advance = typeof offset === 'undefined';
        offset = typeof offset !== 'undefined' ? offset : this.offset;
        value = value >>> 0;
        this.ensureCapacity(offset + ByteBuffer.calculateVarint32(value));
        var dst = this.view,
            size = 0;
        dst.setUint8(offset, value | 0x80);
        if (value >= (1 << 7)) {
          dst.setUint8(offset + 1, (value >> 7) | 0x80);
          if (value >= (1 << 14)) {
            dst.setUint8(offset + 2, (value >> 14) | 0x80);
            if (value >= (1 << 21)) {
              dst.setUint8(offset + 3, (value >> 21) | 0x80);
              if (value >= (1 << 28)) {
                dst.setUint8(offset + 4, (value >> 28) & 0x7F);
                size = 5;
              } else {
                dst.setUint8(offset + 3, dst.getUint8(offset + 3) & 0x7F);
                size = 4;
              }
            } else {
              dst.setUint8(offset + 2, dst.getUint8(offset + 2) & 0x7F);
              size = 3;
            }
          } else {
            dst.setUint8(offset + 1, dst.getUint8(offset + 1) & 0x7F);
            size = 2;
          }
        } else {
          dst.setUint8(offset, dst.getUint8(offset) & 0x7F);
          size = 1;
        }
        if (advance) {
          this.offset += size;
          return this;
        } else {
          return size;
        }
      };
      ByteBuffer.prototype.readVarint32 = function(offset) {
        var advance = typeof offset === 'undefined';
        offset = typeof offset !== 'undefined' ? offset : this.offset;
        var count = 0,
            b,
            src = this.view;
        var value = 0 >>> 0;
        do {
          b = src.getUint8(offset + count);
          if (count < ByteBuffer.MAX_VARINT32_BYTES) {
            value |= ((b & 0x7F) << (7 * count)) >>> 0;
          }
          ++count;
        } while (b & 0x80);
        value = value | 0;
        if (advance) {
          this.offset += count;
          return value;
        } else {
          return {
            "value": value,
            "length": count
          };
        }
      };
      ByteBuffer.prototype.writeZigZagVarint32 = function(value, offset) {
        return this.writeVarint32(ByteBuffer.zigZagEncode32(value), offset);
      };
      ByteBuffer.prototype.readZigZagVarint32 = function(offset) {
        var dec = this.readVarint32(offset);
        if (typeof dec === 'object') {
          dec['value'] = ByteBuffer.zigZagDecode32(dec['value']);
          return dec;
        }
        return ByteBuffer.zigZagDecode32(dec);
      };
      ByteBuffer.MAX_VARINT64_BYTES = 10;
      var TWO_PWR_7_DBL = 1 << 7;
      var TWO_PWR_14_DBL = TWO_PWR_7_DBL * TWO_PWR_7_DBL;
      var TWO_PWR_21_DBL = TWO_PWR_7_DBL * TWO_PWR_14_DBL;
      var TWO_PWR_28_DBL = TWO_PWR_14_DBL * TWO_PWR_14_DBL;
      if (Long) {
        ByteBuffer.prototype.writeVarint64 = function(value, offset) {
          var advance = typeof offset === 'undefined';
          offset = typeof offset !== 'undefined' ? offset : this.offset;
          if (!(typeof value === 'object' && value instanceof Long))
            value = Long.fromNumber(value, false);
          var part0 = value.toInt() >>> 0,
              part1 = value.shiftRightUnsigned(28).toInt() >>> 0,
              part2 = value.shiftRightUnsigned(56).toInt() >>> 0,
              size = ByteBuffer.calculateVarint64(value);
          this.ensureCapacity(offset + size);
          var dst = this.view;
          switch (size) {
            case 10:
              dst.setUint8(offset + 9, (part2 >>> 7) | 0x80);
            case 9:
              dst.setUint8(offset + 8, (part2) | 0x80);
            case 8:
              dst.setUint8(offset + 7, (part1 >>> 21) | 0x80);
            case 7:
              dst.setUint8(offset + 6, (part1 >>> 14) | 0x80);
            case 6:
              dst.setUint8(offset + 5, (part1 >>> 7) | 0x80);
            case 5:
              dst.setUint8(offset + 4, (part1) | 0x80);
            case 4:
              dst.setUint8(offset + 3, (part0 >>> 21) | 0x80);
            case 3:
              dst.setUint8(offset + 2, (part0 >>> 14) | 0x80);
            case 2:
              dst.setUint8(offset + 1, (part0 >>> 7) | 0x80);
            case 1:
              dst.setUint8(offset + 0, (part0) | 0x80);
          }
          dst.setUint8(offset + size - 1, dst.getUint8(offset + size - 1) & 0x7F);
          if (advance) {
            this.offset += size;
            return this;
          } else {
            return size;
          }
        };
        ByteBuffer.prototype.readVarint64 = function(offset) {
          var advance = typeof offset === 'undefined';
          offset = typeof offset !== 'undefined' ? offset : this.offset;
          var start = offset;
          var src = this.view,
              part0,
              part1 = 0,
              part2 = 0,
              b;
          b = src.getUint8(offset++);
          part0 = (b & 0x7F);
          if (b & 0x80) {
            b = src.getUint8(offset++);
            part0 |= (b & 0x7F) << 7;
            if (b & 0x80) {
              b = src.getUint8(offset++);
              part0 |= (b & 0x7F) << 14;
              if (b & 0x80) {
                b = src.getUint8(offset++);
                part0 |= (b & 0x7F) << 21;
                if (b & 0x80) {
                  b = src.getUint8(offset++);
                  part1 = (b & 0x7F);
                  if (b & 0x80) {
                    b = src.getUint8(offset++);
                    part1 |= (b & 0x7F) << 7;
                    if (b & 0x80) {
                      b = src.getUint8(offset++);
                      part1 |= (b & 0x7F) << 14;
                      if (b & 0x80) {
                        b = src.getUint8(offset++);
                        part1 |= (b & 0x7F) << 21;
                        if (b & 0x80) {
                          b = src.getUint8(offset++);
                          part2 = (b & 0x7F);
                          if (b & 0x80) {
                            b = src.getUint8(offset++);
                            part2 |= (b & 0x7F) << 7;
                            if (b & 0x80) {
                              throw (new Error("Data must be corrupt: Buffer overrun"));
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          var value = Long.from28Bits(part0, part1, part2, false);
          if (advance) {
            this.offset = offset;
            return value;
          } else {
            return {
              "value": value,
              "length": offset - start
            };
          }
        };
        ByteBuffer.prototype.writeZigZagVarint64 = function(value, offset) {
          return this.writeVarint64(ByteBuffer.zigZagEncode64(value), offset);
        };
        ByteBuffer.prototype.readZigZagVarint64 = function(offset) {
          var dec = this.readVarint64(offset);
          if (typeof dec === 'object' && !(dec instanceof Long)) {
            dec['value'] = ByteBuffer.zigZagDecode64(dec['value']);
            return dec;
          }
          return ByteBuffer.zigZagDecode64(dec);
        };
      }
      ByteBuffer.prototype.writeVarint = ByteBuffer.prototype.writeVarint32;
      ByteBuffer.prototype.readVarint = ByteBuffer.prototype.readVarint32;
      ByteBuffer.prototype.writeZigZagVarint = ByteBuffer.prototype.writeZigZagVarint32;
      ByteBuffer.prototype.readZigZagVarint = ByteBuffer.prototype.readZigZagVarint32;
      ByteBuffer.calculateVarint32 = function(value) {
        value = value >>> 0;
        if (value < TWO_PWR_7_DBL) {
          return 1;
        } else if (value < TWO_PWR_14_DBL) {
          return 2;
        } else if (value < TWO_PWR_21_DBL) {
          return 3;
        } else if (value < TWO_PWR_28_DBL) {
          return 4;
        } else {
          return 5;
        }
      };
      if (Long) {
        ByteBuffer.calculateVarint64 = function(value) {
          if (!(typeof value === 'object' && value instanceof Long))
            value = Long.fromNumber(value, false);
          var part0 = value.toInt() >>> 0,
              part1 = value.shiftRightUnsigned(28).toInt() >>> 0,
              part2 = value.shiftRightUnsigned(56).toInt() >>> 0;
          if (part2 == 0) {
            if (part1 == 0) {
              if (part0 < TWO_PWR_14_DBL) {
                return part0 < TWO_PWR_7_DBL ? 1 : 2;
              } else {
                return part0 < TWO_PWR_21_DBL ? 3 : 4;
              }
            } else {
              if (part1 < TWO_PWR_14_DBL) {
                return part1 < TWO_PWR_7_DBL ? 5 : 6;
              } else {
                return part1 < TWO_PWR_21_DBL ? 7 : 8;
              }
            }
          } else {
            return part2 < TWO_PWR_7_DBL ? 9 : 10;
          }
        };
      }
      ByteBuffer.zigZagEncode32 = function(n) {
        return (((n |= 0) << 1) ^ (n >> 31)) >>> 0;
      };
      ByteBuffer.zigZagDecode32 = function(n) {
        return ((n >>> 1) ^ -(n & 1)) | 0;
      };
      if (Long) {
        ByteBuffer.zigZagEncode64 = function(n) {
          if (typeof n === 'object' && n instanceof Long) {
            if (n.unsigned)
              n = n.toSigned();
          } else {
            n = Long.fromNumber(n, false);
          }
          return n.shiftLeft(1).xor(n.shiftRight(63)).toUnsigned();
        };
        ByteBuffer.zigZagDecode64 = function(n) {
          if (typeof n === 'object' && n instanceof Long) {
            if (!n.unsigned)
              n = n.toUnsigned();
          } else {
            n = Long.fromNumber(n, true);
          }
          return n.shiftRightUnsigned(1).xor(n.and(Long.ONE).toSigned().negate()).toSigned();
        };
      }
      ByteBuffer.decodeUTF8Char = function(src, offset) {
        var a = src.readUint8(offset),
            b,
            c,
            d,
            e,
            f,
            start = offset,
            charCode;
        if ((a & 0x80) == 0) {
          charCode = a;
          offset += 1;
        } else if ((a & 0xE0) == 0xC0) {
          b = src.readUint8(offset + 1);
          charCode = ((a & 0x1F) << 6) | (b & 0x3F);
          offset += 2;
        } else if ((a & 0xF0) == 0xE0) {
          b = src.readUint8(offset + 1);
          c = src.readUint8(offset + 2);
          charCode = ((a & 0x0F) << 12) | ((b & 0x3F) << 6) | (c & 0x3F);
          offset += 3;
        } else if ((a & 0xF8) == 0xF0) {
          b = src.readUint8(offset + 1);
          c = src.readUint8(offset + 2);
          d = src.readUint8(offset + 3);
          charCode = ((a & 0x07) << 18) | ((b & 0x3F) << 12) | ((c & 0x3F) << 6) | (d & 0x3F);
          offset += 4;
        } else if ((a & 0xFC) == 0xF8) {
          b = src.readUint8(offset + 1);
          c = src.readUint8(offset + 2);
          d = src.readUint8(offset + 3);
          e = src.readUint8(offset + 4);
          charCode = ((a & 0x03) << 24) | ((b & 0x3F) << 18) | ((c & 0x3F) << 12) | ((d & 0x3F) << 6) | (e & 0x3F);
          offset += 5;
        } else if ((a & 0xFE) == 0xFC) {
          b = src.readUint8(offset + 1);
          c = src.readUint8(offset + 2);
          d = src.readUint8(offset + 3);
          e = src.readUint8(offset + 4);
          f = src.readUint8(offset + 5);
          charCode = ((a & 0x01) << 30) | ((b & 0x3F) << 24) | ((c & 0x3F) << 18) | ((d & 0x3F) << 12) | ((e & 0x3F) << 6) | (f & 0x3F);
          offset += 6;
        } else {
          throw (new Error("Cannot decode UTF8 character at offset " + offset + ": charCode (0x" + a.toString(16) + ") is invalid"));
        }
        return {
          "char": charCode,
          "length": offset - start
        };
      };
      ByteBuffer.encodeUTF8Char = function(charCode, dst, offset) {
        var start = offset;
        if (charCode < 0) {
          throw (new Error("Cannot encode UTF8 character: charCode (" + charCode + ") is negative"));
        }
        if (charCode < 0x80) {
          dst.writeUint8(charCode & 0x7F, offset);
          offset += 1;
        } else if (charCode < 0x800) {
          dst.writeUint8(((charCode >> 6) & 0x1F) | 0xC0, offset).writeUint8((charCode & 0x3F) | 0x80, offset + 1);
          offset += 2;
        } else if (charCode < 0x10000) {
          dst.writeUint8(((charCode >> 12) & 0x0F) | 0xE0, offset).writeUint8(((charCode >> 6) & 0x3F) | 0x80, offset + 1).writeUint8((charCode & 0x3F) | 0x80, offset + 2);
          offset += 3;
        } else if (charCode < 0x200000) {
          dst.writeUint8(((charCode >> 18) & 0x07) | 0xF0, offset).writeUint8(((charCode >> 12) & 0x3F) | 0x80, offset + 1).writeUint8(((charCode >> 6) & 0x3F) | 0x80, offset + 2).writeUint8((charCode & 0x3F) | 0x80, offset + 3);
          offset += 4;
        } else if (charCode < 0x4000000) {
          dst.writeUint8(((charCode >> 24) & 0x03) | 0xF8, offset).writeUint8(((charCode >> 18) & 0x3F) | 0x80, offset + 1).writeUint8(((charCode >> 12) & 0x3F) | 0x80, offset + 2).writeUint8(((charCode >> 6) & 0x3F) | 0x80, offset + 3).writeUint8((charCode & 0x3F) | 0x80, offset + 4);
          offset += 5;
        } else if (charCode < 0x80000000) {
          dst.writeUint8(((charCode >> 30) & 0x01) | 0xFC, offset).writeUint8(((charCode >> 24) & 0x3F) | 0x80, offset + 1).writeUint8(((charCode >> 18) & 0x3F) | 0x80, offset + 2).writeUint8(((charCode >> 12) & 0x3F) | 0x80, offset + 3).writeUint8(((charCode >> 6) & 0x3F) | 0x80, offset + 4).writeUint8((charCode & 0x3F) | 0x80, offset + 5);
          offset += 6;
        } else {
          throw (new Error("Cannot encode UTF8 character: charCode (0x" + charCode.toString(16) + ") is too large (>= 0x80000000)"));
        }
        return offset - start;
      };
      ByteBuffer.calculateUTF8Char = function(charCode) {
        if (charCode < 0) {
          throw (new Error("Cannot calculate length of UTF8 character: charCode (" + charCode + ") is negative"));
        }
        if (charCode < 0x80) {
          return 1;
        } else if (charCode < 0x800) {
          return 2;
        } else if (charCode < 0x10000) {
          return 3;
        } else if (charCode < 0x200000) {
          return 4;
        } else if (charCode < 0x4000000) {
          return 5;
        } else if (charCode < 0x80000000) {
          return 6;
        } else {
          throw (new Error("Cannot calculate length of UTF8 character: charCode (0x" + charCode.toString(16) + ") is too large (>= 0x80000000)"));
        }
      };
      ByteBuffer.calculateUTF8String = function(str) {
        str = "" + str;
        var bytes = 0;
        for (var i = 0,
            k = str.length; i < k; ++i) {
          bytes += ByteBuffer.calculateUTF8Char(str.charCodeAt(i));
        }
        return bytes;
      };
      var B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      B64 = B64 + "";
      ByteBuffer.encode64 = function(bb) {
        if (!(bb instanceof ByteBuffer)) {
          bb = ByteBuffer.wrap(bb);
        } else if (bb.length < bb.offset) {
          bb = bb.clone().flip();
        }
        var o1,
            o2,
            o3,
            h1,
            h2,
            h3,
            h4,
            bits,
            i = bb.offset,
            oi = 0,
            out = [];
        do {
          o1 = bb.readUint8(i++);
          o2 = bb.length > i ? bb.readUint8(i++) : 0;
          o3 = bb.length > i ? bb.readUint8(i++) : 0;
          bits = o1 << 16 | o2 << 8 | o3;
          h1 = bits >> 18 & 0x3f;
          h2 = bits >> 12 & 0x3f;
          h3 = bits >> 6 & 0x3f;
          h4 = bits & 0x3f;
          out[oi++] = B64.charAt(h1) + B64.charAt(h2) + B64.charAt(h3) + B64.charAt(h4);
        } while (i < bb.length);
        var enc = out.join(''),
            r = (bb.length - bb.offset) % 3;
        return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
      };
      ByteBuffer.decode64 = function(str, littleEndian) {
        if (typeof str !== 'string') {
          throw (new Error("Illegal argument: Not a string"));
        }
        var o1,
            o2,
            o3,
            h1,
            h2,
            h3,
            h4,
            bits,
            i = 0,
            out = new ByteBuffer(Math.ceil(str.length / 3), littleEndian);
        do {
          h1 = B64.indexOf(str.charAt(i++));
          h2 = B64.indexOf(str.charAt(i++));
          h3 = B64.indexOf(str.charAt(i++));
          h4 = B64.indexOf(str.charAt(i++));
          if (h1 < 0 || h2 < 0 || h3 < 0 || h4 < 0) {
            throw (new Error("Illegal argument: Not a valid base64 encoded string"));
          }
          bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
          o1 = bits >> 16 & 0xff;
          o2 = bits >> 8 & 0xff;
          o3 = bits & 0xff;
          if (h3 == 64) {
            out.writeUint8(o1);
          } else if (h4 == 64) {
            out.writeUint8(o1).writeUint8(o2);
          } else {
            out.writeUint8(o1).writeUint8(o2).writeUint8(o3);
          }
        } while (i < str.length);
        return out.flip();
      };
      ByteBuffer.encodeHex = function(bb) {
        if (!(bb instanceof ByteBuffer)) {
          bb = ByteBuffer.wrap(bb);
        } else if (bb.length < bb.offset) {
          bb = bb.clone().flip();
        }
        if (bb.array === null)
          return "";
        var val,
            out = [];
        for (var i = bb.offset,
            k = bb.length; i < k; ++i) {
          val = bb.view.getUint8(i).toString(16).toUpperCase();
          if (val.length < 2)
            val = "0" + val;
          out.push(val);
        }
        return out.join('');
      };
      ByteBuffer.decodeHex = function(str, littleEndian) {
        if (typeof str !== 'string') {
          throw (new Error("Illegal argument: Not a string"));
        }
        if (str.length % 2 !== 0) {
          throw (new Error("Illegal argument: Not a hex encoded string"));
        }
        var o,
            out = new ByteBuffer(str.length / 2, littleEndian);
        for (var i = 0,
            k = str.length; i < k; i += 2) {
          out.writeUint8(parseInt(str.substring(i, i + 2), 16));
        }
        return out.flip();
      };
      ByteBuffer.encodeBinary = function(bb) {
        if (!(bb instanceof ByteBuffer)) {
          bb = ByteBuffer.wrap(bb);
        } else if (bb.length < bb.offset) {
          bb = bb.clone().flip();
        }
        var out = [],
            view = bb.view;
        for (var i = bb.offset,
            k = bb.length; i < k; ++i) {
          out.push(String.fromCharCode(view.getUint8(i)));
        }
        return out.join('');
      };
      ByteBuffer.decodeBinary = function(str, littleEndian) {
        if (typeof str !== 'string') {
          throw (new Error("Illegal argument: Not a string"));
        }
        var k = str.length,
            dst = new ArrayBuffer(k),
            view = new DataView(dst),
            val;
        for (var i = 0; i < k; ++i) {
          if ((val = str.charCodeAt(i)) > 255)
            throw (new Error("Illegal argument: Not a binary string (char code " + val + ")"));
          view.setUint8(i, val);
        }
        var bb = new ByteBuffer(k, littleEndian, true);
        bb.array = dst;
        bb.view = view;
        bb.length = k;
        return bb;
      };
      ByteBuffer.prototype.writeUTF8String = function(str, offset) {
        var advance = typeof offset === 'undefined';
        offset = typeof offset !== 'undefined' ? offset : this.offset;
        var start = offset;
        var encLen = ByteBuffer.calculateUTF8String(str);
        this.ensureCapacity(offset + encLen);
        for (var i = 0,
            j = str.length; i < j; ++i) {
          offset += ByteBuffer.encodeUTF8Char(str.charCodeAt(i), this, offset);
        }
        if (advance) {
          this.offset = offset;
          return this;
        } else {
          return offset - start;
        }
      };
      ByteBuffer.prototype.readUTF8String = function(chars, offset) {
        var advance = typeof offset === 'undefined';
        offset = typeof offset !== 'undefined' ? offset : this.offset;
        var dec,
            result = "",
            start = offset;
        for (var i = 0; i < chars; ++i) {
          dec = ByteBuffer.decodeUTF8Char(this, offset);
          offset += dec["length"];
          result += String.fromCharCode(dec["char"]);
        }
        if (advance) {
          this.offset = offset;
          return result;
        } else {
          return {
            "string": result,
            "length": offset - start
          };
        }
      };
      ByteBuffer.prototype.readUTF8StringBytes = function(length, offset) {
        var advance = typeof offset === 'undefined';
        offset = typeof offset !== 'undefined' ? offset : this.offset;
        var dec,
            result = "",
            start = offset;
        length = offset + length;
        while (offset < length) {
          dec = ByteBuffer.decodeUTF8Char(this, offset);
          offset += dec["length"];
          result += String.fromCharCode(dec["char"]);
        }
        if (offset != length) {
          throw (new Error("Actual string length differs from the specified: " + ((offset > length ? "+" : "") + offset - length) + " bytes"));
        }
        if (advance) {
          this.offset = offset;
          return result;
        } else {
          return {
            "string": result,
            "length": offset - start
          };
        }
      };
      ByteBuffer.prototype.writeLString = function(str, offset) {
        str = "" + str;
        var advance = typeof offset === 'undefined';
        offset = typeof offset !== 'undefined' ? offset : this.offset;
        var encLen = ByteBuffer.encodeUTF8Char(str.length, this, offset);
        encLen += this.writeUTF8String(str, offset + encLen);
        if (advance) {
          this.offset += encLen;
          return this;
        } else {
          return encLen;
        }
      };
      ByteBuffer.prototype.readLString = function(offset) {
        var advance = typeof offset === 'undefined';
        offset = typeof offset !== 'undefined' ? offset : this.offset;
        var lenDec = ByteBuffer.decodeUTF8Char(this, offset),
            dec = this.readUTF8String(lenDec["char"], offset + lenDec["length"]);
        if (advance) {
          this.offset += lenDec["length"] + dec["length"];
          return dec["string"];
        } else {
          return {
            "string": dec["string"],
            "length": lenDec["length"] + dec["length"]
          };
        }
      };
      ByteBuffer.prototype.writeVString = function(str, offset) {
        str = "" + str;
        var advance = typeof offset === 'undefined';
        offset = typeof offset !== 'undefined' ? offset : this.offset;
        var encLen = this.writeVarint32(ByteBuffer.calculateUTF8String(str), offset);
        encLen += this.writeUTF8String(str, offset + encLen);
        if (advance) {
          this.offset += encLen;
          return this;
        } else {
          return encLen;
        }
      };
      ByteBuffer.prototype.readVString = function(offset) {
        var advance = typeof offset === 'undefined';
        offset = typeof offset !== 'undefined' ? offset : this.offset;
        var lenDec = this.readVarint32(offset);
        var dec = this.readUTF8StringBytes(lenDec["value"], offset + lenDec["length"]);
        if (advance) {
          this.offset += lenDec["length"] + dec["length"];
          return dec["string"];
        } else {
          return {
            "string": dec["string"],
            "length": lenDec["length"] + dec["length"]
          };
        }
      };
      ByteBuffer.prototype.writeCString = function(str, offset) {
        str = "" + str;
        var advance = typeof offset === 'undefined';
        offset = typeof offset !== 'undefined' ? offset : this.offset;
        var encLen = this.writeUTF8String(str, offset);
        this.writeUint8(0, offset + encLen);
        if (advance) {
          this.offset += encLen + 1;
          return this;
        } else {
          return encLen + 1;
        }
      };
      ByteBuffer.prototype.readCString = function(offset) {
        var advance = typeof offset === 'undefined';
        offset = typeof offset !== 'undefined' ? offset : this.offset;
        var dec,
            result = "",
            start = offset;
        do {
          dec = ByteBuffer.decodeUTF8Char(this, offset);
          offset += dec["length"];
          if (dec["char"] != 0)
            result += String.fromCharCode(dec["char"]);
        } while (dec["char"] != 0);
        if (advance) {
          this.offset = offset;
          return result;
        } else {
          return {
            "string": result,
            "length": offset - start
          };
        }
      };
      ByteBuffer.prototype.writeJSON = function(data, offset, stringify) {
        stringify = typeof stringify === 'function' ? stringify : JSON.stringify;
        return this.writeLString(stringify(data), offset);
      };
      ByteBuffer.prototype.readJSON = function(offset, parse) {
        parse = typeof parse === 'function' ? parse : JSON.parse;
        var result = this.readLString(offset);
        if (typeof result === 'string') {
          return parse(result);
        } else {
          return {
            "data": parse(result["string"]),
            "length": result["length"]
          };
        }
      };
      ByteBuffer.prototype.toColumns = function(wrap) {
        if (this.array === null)
          return "DESTROYED";
        wrap = typeof wrap !== 'undefined' ? parseInt(wrap, 10) : 16;
        if (wrap < 1)
          wrap = 16;
        var out = "",
            lines = [],
            val,
            view = this.view;
        if (this.offset == 0 && this.length == 0) {
          out += "|";
        } else if (this.length == 0) {
          out += ">";
        } else if (this.offset == 0) {
          out += "<";
        } else {
          out += " ";
        }
        for (var i = 0,
            k = this.array.byteLength; i < k; ++i) {
          if (i > 0 && i % wrap == 0) {
            while (out.length < 3 * wrap + 1)
              out += "   ";
            lines.push(out);
            out = " ";
          }
          val = view.getUint8(i).toString(16).toUpperCase();
          if (val.length < 2)
            val = "0" + val;
          out += val;
          if (i + 1 == this.offset && i + 1 == this.length) {
            out += "|";
          } else if (i + 1 == this.offset) {
            out += "<";
          } else if (i + 1 == this.length) {
            out += ">";
          } else {
            out += " ";
          }
        }
        if (out != " ") {
          lines.push(out);
        }
        for (i = 0, k = lines.length; i < k; ++i) {
          while (lines[i].length < 3 * wrap + 1)
            lines[i] += "   ";
        }
        var n = 0;
        out = "";
        for (i = 0, k = this.array.byteLength; i < k; ++i) {
          if (i > 0 && i % wrap == 0) {
            lines[n] += " " + out;
            out = "";
            n++;
          }
          val = view.getUint8(i);
          out += val > 32 && val < 127 ? String.fromCharCode(val) : ".";
        }
        if (out != "") {
          lines[n] += " " + out;
        }
        return lines.join("\n");
      };
      ByteBuffer.prototype.printDebug = function(out) {
        if (typeof out !== 'function')
          out = console.log.bind(console);
        out((this.array != null ? "ByteBuffer(offset=" + this.offset + ",markedOffset=" + this.markedOffset + ",length=" + this.length + ",capacity=" + this.array.byteLength + ")" : "ByteBuffer(DESTROYED)") + "\n" + "-------------------------------------------------------------------\n" + this.toColumns() + "\n");
      };
      ByteBuffer.prototype.toHex = function(debug) {
        var out = "",
            val,
            view = this.view,
            i,
            k;
        if (!debug) {
          return ByteBuffer.encodeHex(this);
        } else {
          if (this.array === null)
            return "DESTROYED";
          if (this.offset == 0 && this.length == 0) {
            out += "|";
          } else if (this.length == 0) {
            out += ">";
          } else if (this.offset == 0) {
            out += "<";
          } else {
            out += " ";
          }
          for (i = 0, k = this.array.byteLength; i < k; ++i) {
            val = view.getUint8(i).toString(16).toUpperCase();
            if (val.length < 2)
              val = "0" + val;
            out += val;
            if (i + 1 === this.offset && i + 1 === this.length) {
              out += "|";
            } else if (i + 1 == this.offset) {
              out += "<";
            } else if (i + 1 == this.length) {
              out += ">";
            } else {
              out += " ";
            }
          }
          return out;
        }
      };
      ByteBuffer.prototype.toBinary = function() {
        return ByteBuffer.encodeBinary(this);
      };
      ByteBuffer.prototype.toBase64 = function() {
        if (this.array === null || this.offset >= this.length)
          return "";
        return ByteBuffer.encode64(this);
      };
      ByteBuffer.prototype.toUTF8 = function() {
        if (this.array === null || this.offset >= this.length)
          return "";
        return this.readUTF8StringBytes(this.length - this.offset, this.offset)["string"];
      };
      ByteBuffer.prototype.toString = function(enc) {
        enc = enc || "";
        switch (enc) {
          case "utf8":
            return this.toUTF8();
          case "base64":
            return this.toBase64();
          case "hex":
            return this.toHex();
          case "binary":
            return this.toBinary();
          case "debug":
            return this.toHex(true);
          default:
            if (this.array === null) {
              return "ByteBuffer(DESTROYED)";
            }
            return "ByteBuffer(offset=" + this.offset + ",markedOffset=" + this.markedOffset + ",length=" + this.length + ",capacity=" + this.array.byteLength + ")";
        }
      };
      ByteBuffer.prototype.toArrayBuffer = function(forceCopy) {
        if (this.array === null)
          return null;
        var b = this.clone();
        if (b.offset > b.length) {
          b.flip();
        }
        var copied = false;
        if (b.offset > 0 || b.length < b.array.byteLength) {
          b.compact();
          copied = true;
        }
        return forceCopy && !copied ? b.copy().array : b.array;
      };
      if (Buffer) {
        ByteBuffer.prototype.toBuffer = function() {
          if (this.array === null)
            return null;
          var offset = this.offset,
              length = this.length;
          if (offset > length) {
            var temp = offset;
            offset = length;
            length = temp;
          }
          return new Buffer(new Uint8Array(this.array).subarray(offset, length));
        };
      }
      return ByteBuffer;
    }
    if (typeof module !== 'undefined' && module["exports"]) {
      module["exports"] = loadByteBuffer(require('long'));
    } else if (typeof define !== 'undefined' && define["amd"]) {
      define("ByteBuffer", ["Math/Long"], function(Long) {
        return loadByteBuffer(Long);
      });
    } else {
      if (!global["dcodeIO"])
        global["dcodeIO"] = {};
      global["dcodeIO"]["ByteBuffer"] = loadByteBuffer(global["dcodeIO"]["Long"]);
    }
  })(this);
})(require('buffer').Buffer);
