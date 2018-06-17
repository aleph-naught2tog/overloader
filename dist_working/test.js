"use strict";

var _Signature = require("./Signature");

var _Overload = require("./Overload");

//import { TEST_DATA } from './manipulations';


var assertTrue = function assertTrue(value) {
  if (value) {
    return true;
  } else {
    throw new Error("assertion failed");
  }
};

var assertFalse = function assertFalse(value) {
  return assert(!value);
};

var assert = function assert(something) {
  return {
    equals: function equals(value) {
      return assertTrue(something === value);
    },
    doesNotEqual: function doesNotEqual(value) {
      return assertTrue(something !== value);
    },
    willThrowOn: function willThrowOn() {
      var didThrow = false;

      try {
        something.apply(undefined, arguments);
      } catch (error) {
        didThrow = true;
      }

      assertTrue(didThrow);
    },
    willNotThrowOn: function willNotThrowOn() {
      var didThrow = false;

      try {
        something.apply(undefined, arguments);
      } catch (error) {
        didThrow = true;
      }

      assertFalse(didThrow);
    }
  };
};

assertTrue(true);
assertFalse(false);
assert(assertTrue).willThrowOn(false);
// assert(assertTrue).willThrowOn(true);

var identity = function identity(x) {
  return x;
};

var proxiedValueOf = function proxiedValueOf(obj) {
  return new Proxy(obj.valueOf, {
    apply: function apply() {
      console.log('yo');

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      console.log(args[0], args[1].unboxed);
    }
  });
};

var Class = {
  forName: function forName(name) {
    var result = _Signature.TYPES.REGISTRY.LOAD(name);
    return result;
  }
};

var Concattable = (0, _Signature.UnionType)('Concattable', _Signature.TYPES.STRING, _Signature.TYPES.NUMBER);

var bloop = (0, _Overload.withOverload)(function (x) {
  return x;
}, true);

bloop.overloads.add({
  signature: new _Signature.Signature(Concattable, Concattable),
  method: function method(a, b) {
    return a + b;
  }
});

var newConcat1 = new Concattable("orange");
var newConcat2 = new Concattable(12);
console.log(bloop(newConcat1, newConcat2));

try {
  bloop(15);
} catch (err) {
  console.log("caught");
}

var hasColor = { color: "bdsadsa" };
var Colorable = (0, _Signature.UnionType)('Colorable', hasColor);
var Readable = (0, _Signature.UnionType)('Readable', { read: _Signature.TYPES.LAMBDA });
console.log(Readable);

var IsReadableOrColorable = (0, _Signature.UnionType)('IsReadableOrColorable', Colorable, Readable);
console.log(IsReadableOrColorable);
var beep = {};
// console.log('beep.read: ' + beep.read);

try {
  var green = new Colorable("green");
} catch (err) {
  // console.log("hopefully this threw!")
}

try {
  var _green = new Colorable({ color: 12 });
} catch (err) {
  // console.log("hopefully this threw!")
}

var blue = new Colorable({ color: "blue" });
console.log(blue);
console.log(blue.color);