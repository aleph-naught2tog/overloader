"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mapTypes = exports.mapTypesForBoxing = exports.UnionType = exports.IntersectionType = exports.TYPES = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.Signature = Signature;
exports.NoSuchSignatureError = NoSuchSignatureError;
exports.NoSignatureOfLengthError = NoSignatureOfLengthError;

var _manipulations = require("./manipulations");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var chalk = require('chalk');
var VOID = function () {}();

var TYPES_REGISTRY = new Map();

var checkTypes = function checkTypes(parameter) {
  var keys = (0, _manipulations.getMapKeys)(TYPES_REGISTRY);
  return keys.map(function (key) {
    return TYPES_REGISTRY.get(key);
  }).find(function (type) {
    return parameter instanceof type;
  });
};

var TYPES = exports.TYPES = {
  STRING: _typeof("apple"),
  NUMBER: _typeof(15),
  BOOLEAN: _typeof(true),
  ARRAY: [].constructor.name,
  VOID: '<VOID>',
  NULL: '<NULL>',
  CONSTRUCTOR: '<CONSTRUCTOR>',
  FUNCTION: 'FUNCTION',
  UNDEFINED: '<UNDEFINED>',
  ANY: '<ANY>',
  LAMBDA: '<LAMBDA>',

  REGISTRY: {
    HAS: function HAS(stringName) {
      return TYPES_REGISTRY.has(Symbol.for(stringName));
    },
    LOAD: function LOAD(stringName) {
      var foundType = TYPES_REGISTRY.get(Symbol.for(stringName));

      try {
        console.log(new foundType.constructor());
        return foundType;
      } catch (err) {
        console.log(err);
      }
    },
    SEARCH: function SEARCH(parameter) {
      return checkTypes(parameter);
    }
  },

  register: function register(className, TypeClass) {
    return TYPES_REGISTRY.set(Symbol.for(className), TypeClass);
  }
};

var DefinedBy = function () {
  function DefinedBy(someObject) {
    _classCallCheck(this, DefinedBy);

    this.canonical = Object.keys(someObject).reduce(function (keysCoveredSoFar, currentKey) {
      console.log(keysCoveredSoFar);
      console.log(currentKey);
      return _extends({}, keysCoveredSoFar, _defineProperty({}, currentKey, getTypeNameOf(someObject[currentKey])));
    }, {});

    TYPES.register(this.canonical.toString(), this);
  }

  _createClass(DefinedBy, [{
    key: "toString",
    value: function toString() {
      var _this = this;

      return Object.keys(this.canonical).map(function (key) {
        return key + ":" + _this.canonical[key];
      }).join();
    }
  }]);

  return DefinedBy;
}();

var IntersectionType = exports.IntersectionType = function IntersectionType(name) {
  for (var _len = arguments.length, types = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    types[_key - 1] = arguments[_key];
  }

  var Intersecter = function () {
    _createClass(Intersecter, null, [{
      key: Symbol.hasInstance,
      value: function value(maybeInstance) {
        var type = mapTypes([maybeInstance])[0];

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

      return new Proxy(this, {
        get: function get(thisArg, prop, receiver) {
          return thisArg.unboxed[prop];
        }
      });
    }

    return Intersecter;
  }();

  Intersecter.types = mapTypes(types);


  Intersecter.operationType = Symbol.for("INTERSECTION");
  Intersecter.typeName = name;

  var klass = Intersecter;

  Object.defineProperty(klass, 'name', {
    writable: false, enumerable: false, configurable: true, value: name
  });

  TYPES.register(name, klass);

  return klass;
};

var UnionType = exports.UnionType = function UnionType(name) {
  for (var _len2 = arguments.length, types = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    types[_key2 - 1] = arguments[_key2];
  }

  var Unioner = function () {
    _createClass(Unioner, null, [{
      key: "isA",
      value: function isA(maybeInstance) {
        var type = mapTypes([maybeInstance])[0];
        return this.types.includes(type);
      }
    }, {
      key: Symbol.hasInstance,
      value: function value(maybeInstance) {
        var type = mapTypes([maybeInstance])[0];

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

      return new Proxy(this, {
        get: function get(thisArg, prop, receiver) {
          return thisArg.unboxed[prop];
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

  Unioner.types = mapTypes(types);


  Unioner.operationType = Symbol.for("UNION");
  Unioner.typeName = name;

  var klass = Unioner;

  Object.defineProperty(klass, 'name', {
    writable: false, enumerable: false, configurable: true, value: name
  });

  TYPES.register(name, klass);

  return klass;
};

var reduceObjectToSignature2 = function reduceObjectToSignature2(someObject) {
  return Object.keys(someObject).map(function (key) {
    return key + ":" + getTypeNameOf(someObject[key]);
  }).join();
};

var reduceObjectToSignature = function reduceObjectToSignature(someObject) {
  return Object.keys(someObject).reduce(function (keysCoveredSoFar, currentKey) {
    return _extends({}, keysCoveredSoFar, _defineProperty({}, currentKey, getTypeNameOf(someObject[currentKey])));
  }, {});
};

var isConstructor = function isConstructor(param) {
  var isConstructor = false;

  try {
    param();
  } catch (error) {
    if (error.message.indexOf("class constructors must be invoked") >= 0) {
      isConstructor = true;
    }
  }

  return isConstructor;
};
var switchOnConstructorName = function switchOnConstructorName(param) {
  var constructorName = param.constructor.name;
  switch (constructorName) {
    case 'Array':
      return TYPES.ARRAY;
    case 'Object':
      var newParam = new DefinedBy(param);
      return "{" + newParam.toString() + "}";
    default:
      return constructorName;
  }
};

var Type = function () {
  function Type() {
    _classCallCheck(this, Type);
  }

  _createClass(Type, null, [{
    key: Symbol.hasInstance,
    value: function value(maybeType) {
      var typeName = maybeType.constructor.name;

      if (!typeName) {
        throw new Error(maybeType + " has no constructor name to check.");
      }

      var doesExist = TYPES.REGISTRY.HAS(typeName);
      if (doesExist) {
        maybeType.class = typeName;
      }

      return doesExist;
    }
  }]);

  return Type;
}();

var getTypeNameOf = function getTypeNameOf(param) {
  var onWayIn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  console.log(param);
  if (param instanceof Type) {
    var symbol = Symbol.keyFor(Symbol.for(param.constructor.name));
    return symbol;
  }

  if (onWayIn) {
    var maybeType = TYPES.REGISTRY.SEARCH(param);

    if (maybeType) {
      return maybeType;
    }
  }

  if (Object.values(TYPES).includes(param)) {
    return param;
  }

  switch (param) {
    case null:
      return TYPES.NULL;
    case undefined:
      return TYPES.UNDEFINED;
    case VOID:
      return TYPES.VOID;
  }

  var paramType = typeof param === "undefined" ? "undefined" : _typeof(param);
  switch (paramType) {
    case 'string':
      return TYPES.STRING;
    case 'number':
      return TYPES.NUMBER;
    case 'boolean':
      return TYPES.BOOLEAN;
    case 'function':
      if (isConstructor(param)) {
        return TYPES.CONSTRUCTOR;
      }
      if (param.name) {
        return param.name;
      }
      return TYPES.LAMBDA;
    default:
      return switchOnConstructorName(param);
  }
};

var mapTypesForBoxing = exports.mapTypesForBoxing = function mapTypesForBoxing(parameters) {
  return parameters.map(function (p) {
    return getTypeNameOf(p, true);
  });
};
var mapTypes = exports.mapTypes = function mapTypes(parameters) {
  return parameters.map(function (p) {
    return getTypeNameOf(p);
  });
};

var getSimpleSignature = function getSimpleSignature() {
  for (var _len3 = arguments.length, parameters = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    parameters[_key3] = arguments[_key3];
  }

  return "" + mapTypes(parameters).join();
};

function Signature() {
  var _this2 = this;

  for (var _len4 = arguments.length, parameters = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    parameters[_key4] = arguments[_key4];
  }

  this.structure = mapTypes(parameters);

  this.needsBoxCheck = this.structure.find(function (aParam) {
    return aParam instanceof Type;
  });

  this.allowsAny = this.structure.includes(TYPES.ANY);

  this.length = parameters.length;

  this.toString = function () {
    return getSimpleSignature.apply(undefined, parameters);
  };
  this.equals = function (otherSignature) {
    var result = false;
    if (otherSignature instanceof Signature) {
      if (otherSignature.length === _this2.length) {
        result = _this2.structure.every(function (currentParameter, index) {
          return currentParameter === otherSignature.structure[index];
        });
      }
    }
    return result;
  };
}

function NoSuchSignatureError(signature, overloadedFunction) {
  this.name = 'NoSuchSignatureError';
  this.message = "No function matching signature <" + signature + "> found.\nDid you mean:\n    " + overloadedFunction.getSignatures().map(function (signature) {
    return signature.toString();
  }) + "\n";
}

function NoSignatureOfLengthError(signature, overloadedFunction) {
  this.name = 'NoSignatureOfLengthError';
  this.message = "No function with a signature <" + signature + "> of length " + signature.length + " was found.\nDid you mean:\n    " + overloadedFunction.getSignaturesOfLength(signature.length).map(function (signature) {
    return "* " + signature.toString();
  });
}