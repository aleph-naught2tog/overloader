"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Signature = require("./Signature");

var _Overload = require("./Overload");

var _manipulations = require("./manipulations");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

var withApple = (0, _Overload.withOverload)(function (x) {
  return x;
});
withApple.overloads.add({
  signature: new _Signature.Signature(_Signature.TYPES.ANY),
  method: function method(lengthThing) {
    return lengthThing + " has length " + lengthThing.length;
  }
}).add({
  signature: new _Signature.Signature(_Signature.TYPES.STRING, _Signature.TYPES.STRING),
  method: function method(stringOne, stringTwo) {
    return [(stringOne + stringTwo).toUpperCase()];
  },
  pipe: true
}).add({
  signature: new _Signature.Signature(_Signature.TYPES.ARRAY),
  method: function method(array) {
    return [array.reverse()];
  },
  pipe: true
});

var Orange = function Orange(name) {
  _classCallCheck(this, Orange);

  this.withApple = withApple;

  this.name = name;
};

var UnionType = function UnionType(name) {
  var _class, _temp;

  for (var _len = arguments.length, types = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    types[_key - 1] = arguments[_key];
  }

  _Signature.TYPES.register(name, (_temp = _class = function () {
    function _class() {
      _classCallCheck(this, _class);
    }

    _createClass(_class, null, [{
      key: Symbol.hasInstance,
      value: function value(maybeInstance) {
        var type = (0, _Signature.mapTypes)([maybeInstance])[0];
        return types.includes(type);
      }
    }]);

    return _class;
  }(), _class.types = (0, _Signature.mapTypes)(types), _temp));

  return _Signature.TYPES.REGISTRY.LOAD(name);
};

var IntersectionType = function IntersectionType() {};

var Concattable = UnionType('Concattable', _Signature.TYPES.STRING, _Signature.TYPES.NUMBER);
console.log(Concattable);
console.log("apple" instanceof Concattable);

var bloop = (0, _Overload.withOverload)(function (x) {
  return x;
}, false);

bloop.overloads.add({
  signature: new _Signature.Signature(Concattable, Concattable),
  method: function method(a, b) {
    return a + b;
  }
});

console.log(bloop("a", "b"));

var orange = new Orange("meow");
console.log(orange.withApple("potato", "beef"));
//console.log(orange.withApple([1, 2, 3, 4, 5]));