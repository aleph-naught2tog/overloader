"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Signature = require("./Signature");

var _Overload = require("./Overload");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//import { TEST_DATA } from './manipulations';

var identity = function identity(x) {
  return x;
};

var UnionType = function UnionType(name) {
  for (var _len = arguments.length, types = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    types[_key - 1] = arguments[_key];
  }

  var Unioner = function () {
    _createClass(Unioner, null, [{
      key: "isA",
      value: function isA(maybeInstance) {
        var type = (0, _Signature.mapTypes)([maybeInstance])[0];
        return types.includes(type);
      }
    }, {
      key: Symbol.hasInstance,
      value: function value(maybeInstance) {
        var type = (0, _Signature.mapTypes)([maybeInstance])[0];

        if (type === this.name) {
          return true;
        }

        return types.includes(type);
      }
    }]);

    function Unioner(object) {
      _classCallCheck(this, Unioner);

      if (object instanceof Unioner === false) {
        throw new Error("cannot be cast");
      }
      console.log(this);
      // this.boxed = this;
      this.unboxed = object;
      return new Proxy(this, {
        apply: console.log,
        call: console.log,
        get: function get(target, prop, receiver) {
          console.log('get');
          console.log('  ', prop);
          console.log('------', target[prop]);
          // console.log(receiver);

          return Reflect.get.apply(Reflect, arguments);
        }
      });
    }

    _createClass(Unioner, [{
      key: "valueOf",
      value: function valueOf() {
        return this.unboxed;
      }
    }]);

    return Unioner;
  }();

  Unioner.types = (0, _Signature.mapTypes)(types);
  Unioner.operationType = Symbol.for("UNION");
  Unioner.typeName = name;

  var klass = Unioner;

  Object.defineProperty(klass, 'name', {
    writable: false, enumerable: false, configurable: true, value: name
  });

  _Signature.TYPES.register(name, klass);

  return klass;
};

var Class = {
  forName: function forName(name) {
    var result = _Signature.TYPES.REGISTRY.LOAD(name);
    return result;
  }
};

var Concattable = UnionType('Concattable', _Signature.TYPES.STRING, _Signature.TYPES.NUMBER);

var bloop = (0, _Overload.withOverload)(function (x) {
  return x;
}, true);

bloop.overloads.add({
  signature: new _Signature.Signature(Concattable, Concattable),
  method: function method(a, b) {
    return a + b;
  }
});

var chalk = require('chalk');

var tester = new Concattable("apple");
console.log(tester);
console.log(tester.unboxed);

console.log(bloop(new Concattable("a"), new Concattable("b")));
console.log(bloop("a", "b"));