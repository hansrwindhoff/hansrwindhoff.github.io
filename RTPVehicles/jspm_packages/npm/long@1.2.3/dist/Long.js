/* */ 
"format cjs";
(function(process) {
  (function(global) {
    "use strict";
    var Long = function(low, high, unsigned) {
      if (low && typeof low === 'object') {
        high = low.high;
        unsigned = low.unsigned;
        low = low.low;
      }
      this.low = low | 0;
      this.high = high | 0;
      this.unsigned = !!unsigned;
    };
    var INT_CACHE = {};
    var UINT_CACHE = {};
    Long.fromInt = function(value, unsigned) {
      var obj,
          cachedObj;
      if (!unsigned) {
        value = value | 0;
        if (-128 <= value && value < 128) {
          cachedObj = INT_CACHE[value];
          if (cachedObj)
            return cachedObj;
        }
        obj = new Long(value, value < 0 ? -1 : 0, false);
        if (-128 <= value && value < 128) {
          INT_CACHE[value] = obj;
        }
        return obj;
      } else {
        value = value >>> 0;
        if (0 <= value && value < 256) {
          cachedObj = UINT_CACHE[value];
          if (cachedObj)
            return cachedObj;
        }
        obj = new Long(value, (value | 0) < 0 ? -1 : 0, true);
        if (0 <= value && value < 256) {
          UINT_CACHE[value] = obj;
        }
        return obj;
      }
    };
    Long.fromNumber = function(value, unsigned) {
      unsigned = !!unsigned;
      if (isNaN(value) || !isFinite(value)) {
        return Long.ZERO;
      } else if (!unsigned && value <= -TWO_PWR_63_DBL) {
        return Long.MIN_SIGNED_VALUE;
      } else if (!unsigned && value + 1 >= TWO_PWR_63_DBL) {
        return Long.MAX_SIGNED_VALUE;
      } else if (unsigned && value >= TWO_PWR_64_DBL) {
        return Long.MAX_UNSIGNED_VALUE;
      } else if (value < 0) {
        return Long.fromNumber(-value, unsigned).negate();
      } else {
        return new Long((value % TWO_PWR_32_DBL) | 0, (value / TWO_PWR_32_DBL) | 0, unsigned);
      }
    };
    Long.fromBits = function(lowBits, highBits, unsigned) {
      return new Long(lowBits, highBits, unsigned);
    };
    Long.from28Bits = function(part0, part1, part2, unsigned) {
      return Long.fromBits(part0 | (part1 << 28), (part1 >>> 4) | (part2) << 24, unsigned);
    };
    Long.fromString = function(str, unsigned, radix) {
      if (str.length === 0)
        throw Error('number format error: empty string');
      if (str === "NaN" || str === "Infinity" || str === "+Infinity" || str === "-Infinity")
        return Long.ZERO;
      if (typeof unsigned === 'number') {
        radix = unsigned;
        unsigned = false;
      }
      radix = radix || 10;
      if (radix < 2 || 36 < radix)
        throw Error('radix out of range: ' + radix);
      var p;
      if ((p = str.indexOf('-')) > 0)
        throw Error('number format error: interior "-" character: ' + str);
      else if (p === 0)
        return Long.fromString(str.substring(1), unsigned, radix).negate();
      var radixToPower = Long.fromNumber(Math.pow(radix, 8));
      var result = Long.ZERO;
      for (var i = 0; i < str.length; i += 8) {
        var size = Math.min(8, str.length - i);
        var value = parseInt(str.substring(i, i + size), radix);
        if (size < 8) {
          var power = Long.fromNumber(Math.pow(radix, size));
          result = result.multiply(power).add(Long.fromNumber(value));
        } else {
          result = result.multiply(radixToPower);
          result = result.add(Long.fromNumber(value));
        }
      }
      result.unsigned = unsigned;
      return result;
    };
    var TWO_PWR_16_DBL = 1 << 16;
    var TWO_PWR_24_DBL = 1 << 24;
    var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
    var TWO_PWR_31_DBL = TWO_PWR_32_DBL / 2;
    var TWO_PWR_48_DBL = TWO_PWR_32_DBL * TWO_PWR_16_DBL;
    var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
    var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;
    var TWO_PWR_24 = Long.fromInt(1 << 24);
    Long.ZERO = Long.fromInt(0);
    Long.UZERO = Long.fromInt(0, true);
    Long.ONE = Long.fromInt(1);
    Long.UONE = Long.fromInt(1, true);
    Long.NEG_ONE = Long.fromInt(-1);
    Long.MAX_SIGNED_VALUE = Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0, false);
    Long.MAX_UNSIGNED_VALUE = Long.fromBits(0xFFFFFFFF | 0, 0xFFFFFFFF | 0, true);
    Long.MAX_VALUE = Long.MAX_SIGNED_VALUE;
    Long.MIN_SIGNED_VALUE = Long.fromBits(0, 0x80000000 | 0, false);
    Long.MIN_UNSIGNED_VALUE = Long.fromBits(0, 0, true);
    Long.MIN_VALUE = Long.MIN_SIGNED_VALUE;
    Long.prototype.toInt = function() {
      return this.unsigned ? this.low >>> 0 : this.low;
    };
    Long.prototype.toNumber = function() {
      if (this.unsigned) {
        return ((this.high >>> 0) * TWO_PWR_32_DBL) + (this.low >>> 0);
      }
      return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
    };
    Long.prototype.toString = function(radix) {
      radix = radix || 10;
      if (radix < 2 || 36 < radix) {
        throw (new Error('radix out of range: ' + radix));
      }
      if (this.isZero()) {
        return '0';
      }
      var rem;
      if (this.isNegative()) {
        if (this.equals(Long.MIN_SIGNED_VALUE)) {
          var radixLong = Long.fromNumber(radix);
          var div = this.div(radixLong);
          rem = div.multiply(radixLong).subtract(this);
          return div.toString(radix) + rem.toInt().toString(radix);
        } else {
          return '-' + this.negate().toString(radix);
        }
      }
      var radixToPower = Long.fromNumber(Math.pow(radix, 6), this.unsigned);
      rem = this;
      var result = '';
      while (true) {
        var remDiv = rem.div(radixToPower);
        var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt() >>> 0;
        var digits = intval.toString(radix);
        rem = remDiv;
        if (rem.isZero()) {
          return digits + result;
        } else {
          while (digits.length < 6) {
            digits = '0' + digits;
          }
          result = '' + digits + result;
        }
      }
    };
    Long.prototype.getHighBits = function() {
      return this.high;
    };
    Long.prototype.getHighBitsUnsigned = function() {
      return this.high >>> 0;
    };
    Long.prototype.getLowBits = function() {
      return this.low;
    };
    Long.prototype.getLowBitsUnsigned = function() {
      return this.low >>> 0;
    };
    Long.prototype.getNumBitsAbs = function() {
      if (this.isNegative()) {
        if (this.equals(Long.MIN_SIGNED_VALUE)) {
          return 64;
        } else {
          return this.negate().getNumBitsAbs();
        }
      } else {
        var val = this.high != 0 ? this.high : this.low;
        for (var bit = 31; bit > 0; bit--) {
          if ((val & (1 << bit)) != 0) {
            break;
          }
        }
        return this.high != 0 ? bit + 33 : bit + 1;
      }
    };
    Long.prototype.isZero = function() {
      return this.high == 0 && this.low == 0;
    };
    Long.prototype.isNegative = function() {
      return !this.unsigned && this.high < 0;
    };
    Long.prototype.isOdd = function() {
      return (this.low & 1) == 1;
    };
    Long.prototype.isEven = function() {
      return (this.low & 1) == 0;
    };
    Long.prototype.equals = function(other) {
      if (this.unsigned != other.unsigned && (this.high >>> 31) != (other.high >>> 31))
        return false;
      return (this.high == other.high) && (this.low == other.low);
    };
    Long.prototype.notEquals = function(other) {
      return !this.equals(other);
    };
    Long.prototype.lessThan = function(other) {
      return this.compare(other) < 0;
    };
    Long.prototype.lessThanOrEqual = function(other) {
      return this.compare(other) <= 0;
    };
    Long.prototype.greaterThan = function(other) {
      return this.compare(other) > 0;
    };
    Long.prototype.greaterThanOrEqual = function(other) {
      return this.compare(other) >= 0;
    };
    Long.prototype.compare = function(other) {
      if (this.equals(other)) {
        return 0;
      }
      var thisNeg = this.isNegative();
      var otherNeg = other.isNegative();
      if (thisNeg && !otherNeg)
        return -1;
      if (!thisNeg && otherNeg)
        return 1;
      if (!this.unsigned) {
        return this.subtract(other).isNegative() ? -1 : 1;
      } else {
        return (other.high >>> 0) > (this.high >>> 0) || (other.high == this.high && (other.low >>> 0) > (this.low >>> 0)) ? -1 : 1;
      }
    };
    Long.prototype.negate = function() {
      if (!this.unsigned && this.equals(Long.MIN_SIGNED_VALUE)) {
        return Long.MIN_SIGNED_VALUE;
      }
      return this.not().add(Long.ONE);
    };
    Long.prototype.add = function(other) {
      var a48 = this.high >>> 16;
      var a32 = this.high & 0xFFFF;
      var a16 = this.low >>> 16;
      var a00 = this.low & 0xFFFF;
      var b48 = other.high >>> 16;
      var b32 = other.high & 0xFFFF;
      var b16 = other.low >>> 16;
      var b00 = other.low & 0xFFFF;
      var c48 = 0,
          c32 = 0,
          c16 = 0,
          c00 = 0;
      c00 += a00 + b00;
      c16 += c00 >>> 16;
      c00 &= 0xFFFF;
      c16 += a16 + b16;
      c32 += c16 >>> 16;
      c16 &= 0xFFFF;
      c32 += a32 + b32;
      c48 += c32 >>> 16;
      c32 &= 0xFFFF;
      c48 += a48 + b48;
      c48 &= 0xFFFF;
      return Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned);
    };
    Long.prototype.subtract = function(other) {
      return this.add(other.negate());
    };
    Long.prototype.multiply = function(other) {
      if (this.isZero()) {
        return Long.ZERO;
      } else if (other.isZero()) {
        return Long.ZERO;
      }
      if (this.equals(Long.MIN_VALUE)) {
        return other.isOdd() ? Long.MIN_VALUE : Long.ZERO;
      } else if (other.equals(Long.MIN_VALUE)) {
        return this.isOdd() ? Long.MIN_VALUE : Long.ZERO;
      }
      if (this.isNegative()) {
        if (other.isNegative()) {
          return this.negate().multiply(other.negate());
        } else {
          return this.negate().multiply(other).negate();
        }
      } else if (other.isNegative()) {
        return this.multiply(other.negate()).negate();
      }
      if (this.lessThan(TWO_PWR_24) && other.lessThan(TWO_PWR_24)) {
        return Long.fromNumber(this.toNumber() * other.toNumber(), this.unsigned);
      }
      var a48 = this.high >>> 16;
      var a32 = this.high & 0xFFFF;
      var a16 = this.low >>> 16;
      var a00 = this.low & 0xFFFF;
      var b48 = other.high >>> 16;
      var b32 = other.high & 0xFFFF;
      var b16 = other.low >>> 16;
      var b00 = other.low & 0xFFFF;
      var c48 = 0,
          c32 = 0,
          c16 = 0,
          c00 = 0;
      c00 += a00 * b00;
      c16 += c00 >>> 16;
      c00 &= 0xFFFF;
      c16 += a16 * b00;
      c32 += c16 >>> 16;
      c16 &= 0xFFFF;
      c16 += a00 * b16;
      c32 += c16 >>> 16;
      c16 &= 0xFFFF;
      c32 += a32 * b00;
      c48 += c32 >>> 16;
      c32 &= 0xFFFF;
      c32 += a16 * b16;
      c48 += c32 >>> 16;
      c32 &= 0xFFFF;
      c32 += a00 * b32;
      c48 += c32 >>> 16;
      c32 &= 0xFFFF;
      c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
      c48 &= 0xFFFF;
      return Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned);
    };
    Long.prototype.div = function(other) {
      if (other.isZero()) {
        throw (new Error('division by zero'));
      } else if (this.isZero()) {
        return this.unsigned ? Long.UZERO : Long.ZERO;
      }
      var approx,
          rem,
          res;
      if (this.equals(Long.MIN_SIGNED_VALUE)) {
        if (other.equals(Long.ONE) || other.equals(Long.NEG_ONE)) {
          return Long.MIN_SIGNED_VALUE;
        } else if (other.equals(Long.MIN_SIGNED_VALUE)) {
          return Long.ONE;
        } else {
          var halfThis = this.shiftRight(1);
          approx = halfThis.div(other).shiftLeft(1);
          if (approx.equals(Long.ZERO)) {
            return other.isNegative() ? Long.ONE : Long.NEG_ONE;
          } else {
            rem = this.subtract(other.multiply(approx));
            res = approx.add(rem.div(other));
            return res;
          }
        }
      } else if (other.equals(Long.MIN_SIGNED_VALUE)) {
        return this.unsigned ? Long.UZERO : Long.ZERO;
      }
      if (this.isNegative()) {
        if (other.isNegative()) {
          return this.negate().div(other.negate());
        } else {
          return this.negate().div(other).negate();
        }
      } else if (other.isNegative()) {
        return this.div(other.negate()).negate();
      }
      res = Long.ZERO;
      rem = this;
      while (rem.greaterThanOrEqual(other)) {
        approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));
        var log2 = Math.ceil(Math.log(approx) / Math.LN2);
        var delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48);
        var approxRes = Long.fromNumber(approx);
        var approxRem = approxRes.multiply(other);
        while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
          approx -= delta;
          approxRes = Long.fromNumber(approx, this.unsigned);
          approxRem = approxRes.multiply(other);
        }
        if (approxRes.isZero()) {
          approxRes = Long.ONE;
        }
        res = res.add(approxRes);
        rem = rem.subtract(approxRem);
      }
      return res;
    };
    Long.prototype.modulo = function(other) {
      return this.subtract(this.div(other).multiply(other));
    };
    Long.prototype.not = function() {
      return Long.fromBits(~this.low, ~this.high, this.unsigned);
    };
    Long.prototype.and = function(other) {
      return Long.fromBits(this.low & other.low, this.high & other.high, this.unsigned);
    };
    Long.prototype.or = function(other) {
      return Long.fromBits(this.low | other.low, this.high | other.high, this.unsigned);
    };
    Long.prototype.xor = function(other) {
      return Long.fromBits(this.low ^ other.low, this.high ^ other.high, this.unsigned);
    };
    Long.prototype.shiftLeft = function(numBits) {
      if ((numBits &= 63) === 0)
        return this;
      else if (numBits < 32)
        return Long.fromBits(this.low << numBits, (this.high << numBits) | (this.low >>> (32 - numBits)), this.unsigned);
      else
        return Long.fromBits(0, this.low << (numBits - 32), this.unsigned);
    };
    Long.prototype.shiftRight = function(numBits) {
      if ((numBits &= 63) === 0)
        return this;
      else if (numBits < 32)
        return Long.fromBits((this.low >>> numBits) | (this.high << (32 - numBits)), this.high >> numBits, this.unsigned);
      else
        return Long.fromBits(this.high >> (numBits - 32), this.high >= 0 ? 0 : -1, this.unsigned);
    };
    Long.prototype.shiftRightUnsigned = function(numBits) {
      numBits &= 63;
      if (numBits == 0) {
        return this;
      } else {
        var high = this.high;
        if (numBits < 32) {
          var low = this.low;
          return Long.fromBits((low >>> numBits) | (high << (32 - numBits)), high >>> numBits, this.unsigned);
        } else if (numBits == 32) {
          return Long.fromBits(high, 0, this.unsigned);
        } else {
          return Long.fromBits(high >>> (numBits - 32), 0, this.unsigned);
        }
      }
    };
    Long.prototype.toSigned = function() {
      var l = this.clone();
      l.unsigned = false;
      return l;
    };
    Long.prototype.toUnsigned = function() {
      var l = this.clone();
      l.unsigned = true;
      return l;
    };
    Long.prototype.clone = function() {
      return new Long(this.low, this.high, this.unsigned);
    };
    if (typeof module != 'undefined' && module["exports"]) {
      module["exports"] = Long;
    } else if (typeof define != 'undefined' && define["amd"]) {
      define("Math/Long", [], function() {
        return Long;
      });
    } else {
      if (!global["dcodeIO"]) {
        global["dcodeIO"] = {};
      }
      global["dcodeIO"]["Long"] = Long;
    }
  })(this);
})(require('process'));
