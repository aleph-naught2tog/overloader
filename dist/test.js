"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Signature = require("./Signature");

var _Overload = require("./Overload");

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
          console.log('same name');
          return true;
        }

        return types.includes(type);
        // return false;
      }
    }]);

    function Unioner(object) {
      _classCallCheck(this, Unioner);

      console.log("###### unioner name:" + Unioner.name);
      // if (Unioner.isA(object) === false) {
      console.log("constructor");
      console.log(object);
      if (object instanceof Unioner === false) {
        throw new Error("cannot be cast");
      }
    }

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
    console.log("==== START LOAD");
    var result = _Signature.TYPES.REGISTRY.LOAD(name);
    console.log("==== END LOAD");

    return result;
  }
};

var boop = UnionType('Concattable', _Signature.TYPES.STRING, _Signature.TYPES.NUMBER);

function Applier(target, thisArg, argumentList) {
  console.log("++++++ APPLY");
  console.log(target);
  console.log(thisArg);
  console.log(argumentList);
  console.log("++++++ END APPLY");

  return target(argumentList);
}

var concatHandler = {
  apply: Applier,
  construct: function construct(target, argumentList, thisArg) {
    console.log("____ CONSTRUCTOR ");
    console.log(target);
    console.log(thisArg);
    console.log(argumentList);
    console.log("____ END CONSTRUCTOR ");

    return new (Function.prototype.bind.apply(target, [null].concat(_toConsumableArray(argumentList))))();
  }
};

var Concattable = new Proxy(boop, concatHandler);

Class.forName('Concattable');

var bloop = (0, _Overload.withOverload)(function (x) {
  return x;
}, false);

bloop.overloads.add({
  signature: new _Signature.Signature(Concattable, Concattable),
  method: function method(a, b) {
    return a + b;
  }
});
var chalk = require('chalk');
console.log(chalk.yellow("~~~~ before new..."));
console.log(new Concattable("meow"));
// console.log(bloop(new Concattable("a"), new Concattable("b")));
console.log(chalk.yellow("~~~~ after new..."));

// let orange = new Orange("meow");
// console.log(orange.withApple("potato", "beef"));
//console.log(orange.withApple([1, 2, 3, 4, 5]));