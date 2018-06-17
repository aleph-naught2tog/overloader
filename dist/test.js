"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Signature = require("./Signature");

var _Overload = require("./Overload");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//import { TEST_DATA } from './manipulations';

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

var UnionType = function UnionType(name) {
  for (var _len2 = arguments.length, types = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    types[_key2 - 1] = arguments[_key2];
  }

  var Unioner = function () {
    _createClass(Unioner, null, [{
      key: "isA",
      value: function isA(maybeInstance) {
        var type = (0, _Signature.mapTypes)([maybeInstance])[0];
        return this.types.includes(type);
      }
    }, {
      key: Symbol.hasInstance,
      value: function value(maybeInstance) {
        var type = (0, _Signature.mapTypes)([maybeInstance])[0];

        if (type === this.name) {
          return true;
        }

        return this.types.includes(type);
      }
    }]);

    function Unioner(object) {
      _classCallCheck(this, Unioner);

      if (object instanceof Unioner === false) {
        throw new Error("cannot be cast");
      }
      // this.boxed = this;
      this.unboxed = object;
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

var IntersectionType = function IntersectionType(name) {
  for (var _len3 = arguments.length, types = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
    types[_key3 - 1] = arguments[_key3];
  }

  var Intersecter = function () {
    _createClass(Intersecter, null, [{
      key: Symbol.hasInstance,
      value: function value(maybeInstance) {
        var type = (0, _Signature.mapTypes)([maybeInstance])[0];

        if (type === this.name) {
          return true;
        }

        return types.includes(type);
      }
    }]);

    function Intersecter(object) {
      _classCallCheck(this, Intersecter);

      if (object instanceof Intersecter === false) {
        throw new Error("cannot be cast as intersection type");
      }

      this.unboxed = object;
    }

    return Intersecter;
  }();

  Intersecter.types = (0, _Signature.mapTypes)(types);
  Intersecter.operationType = Symbol.for("INTERSECTION");
  Intersecter.typeName = name;

  var klass = Intersecter;

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

var newConcat1 = new Concattable("orange");
var newConcat2 = new Concattable(12);
console.log(bloop(newConcat1, newConcat2));

try {
  bloop(15);
} catch (err) {
  console.log("caught");
}

var hasColor = { color: "bdsadsa" };

var Colorable = UnionType('Colorable', hasColor);
//
// try {
//   const green = new Colorable("green");
// } catch (err) {
//   console.log("hopefully this threw!")
// }

var blue = new Colorable({ color: "blue" });
console.log(blue);