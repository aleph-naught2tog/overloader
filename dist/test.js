"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _Signature = require("./Signature");

var _Overload = require("./Overload");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var identity = function identity(x) {
  return x;
};
var bob = (0, _Overload.withOverload)(identity);

function Test() {}

var testObject = new Test();

bob.overloads.add({
  signature: new _Signature.Signature("a", 1),
  method: function method(a, b) {
    return [b, a];
  },
  pipe: true
}).add({
  signature: new _Signature.Signature(1, "a"),
  method: function method(a, b) {
    return a + " " + b;
  }
}).add({
  signature: new _Signature.Signature("a", 1, "c"),
  method: function method(a, b, c) {
    return ["" + a + c, b];
  },
  pipe: true
}).add({
  signature: new _Signature.Signature(testObject),
  method: function method(a) {
    return [1, 'hello'];
  },
  pipe: true
}).add({
  signature: new _Signature.Signature(),
  method: function method() {
    return "orange";
  }
}).add({
  signature: new _Signature.Signature(_Signature.TYPES.ANY),
  method: function method(bob) {
    return "apple";
  }
});

console.log(bob(10, "apple")); // 10 apple
console.log("----------");

console.log(bob("orange", 12)); // 12 orange
console.log("----------");

console.log(bob("red", 55, "green")); // 55 redgreen
console.log("----------");

console.log(bob([1, 2, 3])); // "apple"
console.log("----------");

console.log(bob(new Test())); // 1 hello
console.log("----------");

// should fail
console.log(bob(null, null));
console.log("----------");

var lengthFilterWithOverloads = function lengthFilterWithOverloads(filterBase) {
  var filter = (0, _Overload.withOverload)(filterBase.method, false);

  filter.overloads.add({
    signature: new _Signature.Signature(_Signature.TYPES.ARRAY),
    method: function method(array) {
      return array.filter(function (obj) {
        return obj.length >= 5;
      });
    }
  }).add({
    signature: new _Signature.Signature(_Signature.TYPES.NUMBER),
    method: function method(number) {
      return [function (obj) {
        return obj.length >= number;
      }];
    },
    pipe: true
  }).add({
    signature: new _Signature.Signature(_Signature.TYPES.LAMBDA),
    method: function method(filterFunction) {
      return filterFunction;
    }
  });

  return filter;
};

var testArray = ["apple", "bear", "twentytwo", "a"];

var filter = lengthFilterWithOverloads(identity);

var omgItWorked = testArray.filter(filter(5));

console.log(omgItWorked);

var WrongTypeError = function (_Error) {
  _inherits(WrongTypeError, _Error);

  function WrongTypeError(message) {
    _classCallCheck(this, WrongTypeError);

    var _this = _possibleConstructorReturn(this, (WrongTypeError.__proto__ || Object.getPrototypeOf(WrongTypeError)).call(this, message));

    _this.message = message;
    _this.name = 'WrongTypeError';
    return _this;
  }

  return WrongTypeError;
}(Error);

function TypedArray(type) {
  var array = [];
  array.type = type;

  array.addValue = function (value) {
    if ((typeof value === "undefined" ? "undefined" : _typeof(value)) === type) {
      return true;
    } else {
      return false;
    }
  };

  return new Proxy(array, {
    set: function set(target, property, value, receiver) {
      var shouldProceed = false;

      switch (property) {
        case "length":
          shouldProceed = true;
          break;
        default:
          // should be the number of location
          shouldProceed = target.addValue(value);
          break;
      }

      if (shouldProceed) {
        target[property] = value;
        return true;
      } else {
        throw new WrongTypeError("<" + value + "> is not of " + array.type);
      }
    }
  });
}

function StringArray() {
  var result = TypedArray.call(this, "string");

  return result;
}

function NumberArray() {
  return new TypedArray("number");
}

function BooleanArray() {
  return new TypedArray("boolean");
}

var aggregate = (0, _Overload.withOverload)(function (x) {
  return x;
}, false);
aggregate.overloads.add({
  signature: new _Signature.Signature(new StringArray()),
  method: function method(array) {
    return [array, function (a, b) {
      return "" + a + b;
    }];
  },
  pipe: true
})
// .add({ signature: new Signature(new NumberArray()) })
.add({ signature: new _Signature.Signature(new BooleanArray()), method: function method(array) {
    return [array, function (a, b) {
      return "xX";
    }];
  }, pipe: true }).add({ signature: new _Signature.Signature(new NumberArray()), method: function method(array) {
    return [array, function (a, b) {
      return a + b;
    }];
  }, pipe: true }).add({ signature: new _Signature.Signature(_Signature.TYPES.ANY, _Signature.TYPES.LAMBDA), method: function method(array, reducer) {
    return array.reduce(reducer);
  } });

var strings = new StringArray();
strings.push("apple");
strings.push("banana");
console.log(strings);
console.log(typeof strings === "undefined" ? "undefined" : _typeof(strings));
console.log(strings.constructor.name);

var numbers = new NumberArray();
numbers.push(1);
numbers.push(22);
numbers.push(900);

var booleans = new BooleanArray();
booleans.push(true);
booleans.push(true);
booleans.push(true);
booleans.push(false);
booleans.push(false);

console.log(strings);

console.log(aggregate(strings));
console.log(aggregate(numbers));
console.log(aggregate(booleans));