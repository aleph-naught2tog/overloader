'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _manipulations = require('./manipulations');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var VOID = function () {}();

var TYPES = {
  STRING: _typeof("apple"),
  NUMBER: _typeof(15),
  BOOLEAN: _typeof(true),
  ARRAY: [].constructor.name,
  VOID: '<VOID>',
  NULL: '<NULL>',
  FUNCTION: 'FUNCTION',
  UNDEFINED: '<UNDEFINED>',
  ANY: '<ANY>'
};

var asOptional = function asOptional(param) {};
var withDefault = function withDefault(param) {
  return param || defaultValue;
};

var TEST_STRING_ARRAY = ["string", "string"];

var reduceObjectToSignature = function reduceObjectToSignature(someObject) {
  return Object.keys(someObject).map(function (key) {
    return key + ':' + switchOnTypeof(someObject[key]);
  }).join();
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
      return '{' + reduceObjectToSignature(param) + '}';
    default:
      return constructorName;
  }
};

var switchOnTypeof = function switchOnTypeof(param) {
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

  var paramType = typeof param === 'undefined' ? 'undefined' : _typeof(param);
  switch (paramType) {
    case 'string':
      return TYPES.STRING;
    case 'number':
      return TYPES.NUMBER;
    case 'boolean':
      return TYPES.BOOLEAN;
    case 'function':
      return isConstructor(param) ? "FUNCTION" : param.name;
    // return getSimpleSignature(param);
    default:
      return switchOnConstructorName(param);
  }
};

var mapTypes = function mapTypes(parameters) {
  return parameters.map(switchOnTypeof);
};

var getSimpleSignature = function getSimpleSignature() {
  for (var _len = arguments.length, parameters = Array(_len), _key = 0; _key < _len; _key++) {
    parameters[_key] = arguments[_key];
  }

  return '' + mapTypes(parameters).join();
};

function Signature() {
  var _this = this;

  for (var _len2 = arguments.length, parameters = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    parameters[_key2] = arguments[_key2];
  }

  this.structure = mapTypes(parameters);
  this.toString = function () {
    return getSimpleSignature.apply(undefined, parameters);
  };
  this.number = parameters.length;

  this.equals = function (otherSignature) {
    var result = false;
    if (otherSignature instanceof Signature) {
      if (otherSignature.number === _this.number) {
        result = _this.structure.every(function (currentParameter, index) {
          return currentParameter === otherSignature.structure[index];
        });
      }
    }

    return result;
  };
}

var pipeHandler = {
  apply: function apply(target, self, argumentList) {
    var functionWithOverloads = argumentList.shift();
    var resultOfCurrentCall = target.apply(undefined, _toConsumableArray(argumentList));

    if (self.shouldPipe) {
      return functionWithOverloads({ PIPE: resultOfCurrentCall });
    } else {
      return resultOfCurrentCall;
    }
  }
};

function Overload(_ref) {
  var _this2 = this;

  var signature = _ref.signature,
      method = _ref.method,
      _ref$pipe = _ref.pipe,
      pipe = _ref$pipe === undefined ? null : _ref$pipe;

  var self = this;

  this.signature = signature instanceof Signature ? signature : new (Function.prototype.bind.apply(Signature, [null].concat(_toConsumableArray(signature))))();

  this.key = this.signature.toString();
  this.shouldPipe = pipe;

  this.method = new Proxy(method, pipeHandler);

  this.getPipedOutput = function () {
    return _this2.method.apply(_this2, arguments).PIPE;
  };

  this.toString = this.signature.toString();
}

function SignatureError(signature, message) {
  this.name = 'SignatureError';
  this.message = 'No function matching signature <' + signature + '> found.';
}

var withOverload = function withOverload(someFunction) {
  var allowDefault = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;


  if (!someFunction) {
    someFunction = function someFunction(x) {
      return x;
    };
  }

  var self = someFunction;
  someFunction.calls = new Map();
  someFunction.ownName = self.name ? self.name : "<lambda>";

  someFunction.overload = function (_ref2) {
    var signature = _ref2.signature,
        method = _ref2.method,
        pipe = _ref2.pipe;

    var overload = new Overload({ signature: signature, method: method, pipe: pipe });
    someFunction.calls.set(overload.key, overload);
    return self;
  };

  someFunction.overloads = {
    all: self.calls,
    add: function add() {
      self.overload.apply(self, arguments);

      return self.overloads;
    }
  };

  someFunction.getOverload = function (signature) {
    return someFunction.calls.get(signature);
  };
  someFunction.getOverloadByArguments = function (allArguments) {
    var signature = getSimpleSignature.apply(undefined, _toConsumableArray(allArguments));

    if (!someFunction.calls.has(signature)) {
      if (allowDefault) {
        return someFunction.apply(undefined, _toConsumableArray(allArguments));
      }

      throw new SignatureError(signature);
    }

    return someFunction.getOverload(signature);
  };

  // now we hijack the main call....
  var handler = {
    apply: function apply(target, thisArg, allArguments) {
      var _matchingOverload3;

      var matchingOverload = target.getOverloadByArguments(allArguments);
      var realArguments = allArguments;

      if (thisArg !== undefined) {
        var _matchingOverload;

        return (_matchingOverload = matchingOverload).call.apply(_matchingOverload, [thisArg].concat(_toConsumableArray(realArguments)));
      }

      while (matchingOverload.shouldPipe) {
        var _matchingOverload2;

        realArguments = (_matchingOverload2 = matchingOverload).getPipedOutput.apply(_matchingOverload2, [target].concat(_toConsumableArray(realArguments)));

        matchingOverload = target.getOverloadByArguments(realArguments);
      }

      return (_matchingOverload3 = matchingOverload).method.apply(_matchingOverload3, [target].concat(_toConsumableArray(realArguments)));
    }
  };

  return new Proxy(someFunction, handler);
};

var identity = function identity(x) {
  return x;
};
var bob = withOverload(identity);

function Test() {}

var testObject = new Test();

bob.overloads.add({
  signature: new Signature("a", 1),
  method: function method(a, b) {
    return [b, a];
  },
  pipe: true
}).add({
  signature: new Signature(1, "a"),
  method: function method(a, b) {
    return a + ' ' + b;
  }
}).add({
  signature: new Signature("a", 1, "c"),
  method: function method(a, b, c) {
    return ['' + a + c, b];
  },
  pipe: true
}).add({
  signature: new Signature(testObject),
  method: function method(a) {
    return [1, 'hello'];
  },
  pipe: true
}).add({
  signature: new Signature(),
  method: function method() {
    return "apple";
  }
});

//
// console.log(bob(10, "apple")); // 10 apple
// console.log("----------");
//
// console.log(bob("orange", 12)); // 12 orange
// console.log("----------");
//
// console.log(bob("red", 55, "green")); // 55 redgreen
// console.log("----------");
//
// console.log(bob(testObject));
// console.log(bob());

// will this blow up?

var overloadedFilter = function overloadedFilter(filter) {
  return withOverload(filter);
};

// console.log(new Signature(1, a => "a"));


var filterWithOverloads = function filterWithOverloads(filterBase) {
  var filter = withOverload(filterBase);

  filter.overloads.add({
    signature: new Signature(TYPES.NUMBER),
    method: function method(a) {
      return [function (obj) {
        return obj.length >= 5;
      }];
    },
    pipe: true
  });

  return filter;
};

var testArray = ["apple", "bear", "twentytwo", "a"];
var testArrayFilter = filterWithOverloads(testArray.filter);

testArray.filter = testArrayFilter;

console.log(testArray.filter(5));