'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mapTypes = undefined;

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
    default:
      return switchOnConstructorName(param);
  }
};

var mapTypes = exports.mapTypes = function mapTypes(parameters) {
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
  this.allowsAny = this.structure.includes(TYPES.ANY);
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
    console.log(argumentList);
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

  this.shouldPipe = pipe;
  this.method = new Proxy(method, pipeHandler);
  this.getPipedOutput = function () {
    console.log(_this2.method.apply(_this2, arguments));
    return _this2.method.apply(_this2, arguments).PIPE;
  };
  this.toString = this.signature.toString();
}

function SignatureError(signature, message) {
  this.name = 'SignatureError';
  this.message = 'No function matching signature <' + signature + '> found.';
}

function SignedFunction(_ref2) {
  var signature = _ref2.signature,
      method = _ref2.method;

  this.signature = signature;
  this.method = method;
}

var withOverload = function withOverload(someFunction) {
  var allowDefault = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;


  if (!someFunction) {
    someFunction = function someFunction(x) {
      return x;
    };
  }

  var self = void 0;

  if (someFunction instanceof SignedFunction) {
    self = someFunction.method;
  } else {
    self = someFunction;
  }

  self.calls = new Map();

  self.ownName = self.name ? self.name : "<lambda>";

  self.overload = function (_ref3) {
    var signature = _ref3.signature,
        method = _ref3.method,
        pipe = _ref3.pipe;

    var overload = new Overload({ signature: signature, method: method, pipe: pipe });
    console.log(overload);
    self.calls.set(overload.signature, overload);
    return self;
  };

  self.overloads = {
    all: self.calls,
    add: function add() {
      var _self;

      (_self = self).overload.apply(_self, arguments);
      return self.overloads;
    }
  };

  if (someFunction instanceof SignedFunction) {
    self.overloads.add({ signature: someFunction.signature, method: someFunction.method });
  }

  self.getSignatures = function () {
    return (0, _manipulations.getMapKeys)(self.calls);
  };
  self.getStringSignatures = function () {
    return (0, _manipulations.mapToString)(self.getSignatures());
  };

  self.allowsDefault = allowDefault;
  self.getSignaturesWithAny = function () {
    return self.getSignatures().filter(function (signature) {
      return signature.allowsAny;
    });
  };

  self.allowsAny = function () {
    return self.getSignaturesWithAny().length !== 0;
  };

  self.getOverload = function (signature) {
    var matchByStructure = function matchByStructure(keySignature) {
      return keySignature.equals(signature);
    };
    var matchingKey = self.getSignatures().find(matchByStructure);

    if (matchingKey === undefined) {
      throw new SignatureError(signature);
    }

    return self.calls.get(matchingKey);
  };

  self.hasSignaturesOfNumber = function (number) {
    return self.getSignatures().find(function (signature) {
      return signature.number === number;
    });
  };

  self.hasOverloadFor = function (signature) {
    return self.getStringSignatures().includes(signature.toString());
  };
  self.doesNotHaveOverloadFor = function (signature) {
    return !self.hasOverloadFor(signature);
  };

  var matchWithAnyFound = function matchWithAnyFound(signature) {
    return self.getSignaturesWithAny().filter(function (wildcardSignature) {
      return wildcardSignature.number === signature.number;
    }).find(function (wildcardSignature) {
      var allTypesMatch = false;
      var sameType = function sameType(typeOne, typeTwo) {
        return typeOne === typeTwo || typeOne === TYPES.ANY || typeTwo === TYPES.ANY;
      };
      wildcardSignature.structure.forEach(function (type, index) {
        allTypesMatch = sameType(type, signature.structure[index]);
      });

      return allTypesMatch;
    });
  };

  self.getOverloadByArguments = function (allArguments) {
    var hasAllowedArgumentCount = self.hasSignaturesOfNumber(allArguments.length);

    var shouldFailFast = !hasAllowedArgumentCount && !self.allowsAny() && !self.allowsDefault;
    var mustBeExactMatch = !self.allowsAny() && !self.allowsDefault;

    if (shouldFailFast) {
      throw new SignatureError(signature);
    }

    var signature = new (Function.prototype.bind.apply(Signature, [null].concat(_toConsumableArray(allArguments))))();

    console.log(allArguments);
    console.log(signature);

    if (self.hasOverloadFor(signature)) {
      console.log('has overload');
      console.log(self.getOverload(signature));
      return self.getOverload(signature);
    }

    if (mustBeExactMatch) {
      throw new SignatureError(signature);
    }

    if (self.allowsAny()) {
      var maybeSignature = matchWithAnyFound(signature);

      if (maybeSignature) {
        return self.getOverload(maybeSignature);
      }
    }

    if (self.allowsDefault) {
      return self.apply(undefined, _toConsumableArray(allArguments));
    }
  };

  // now we hijack the main call....
  var handler = {
    apply: function apply(target, thisArg, allArguments) {
      var _matchingOverload2;

      console.log(allArguments);
      var matchingOverload = target.getOverloadByArguments(allArguments);
      var realArguments = allArguments;

      while (matchingOverload.shouldPipe) {
        var _matchingOverload;

        realArguments = (_matchingOverload = matchingOverload).getPipedOutput.apply(_matchingOverload, [target].concat(_toConsumableArray(realArguments)));
        matchingOverload = target.getOverloadByArguments(realArguments);
      }

      return (_matchingOverload2 = matchingOverload).method.apply(_matchingOverload2, [target].concat(_toConsumableArray(realArguments)));
    }
  };

  return new Proxy(self, handler);
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
}).add({
  signature: new Signature(TYPES.ANY),
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
//
// console.log(bob(testObject));
// console.log(bob());

// will this blow up?

var overloadedFilter = function overloadedFilter(filter) {
  return withOverload(filter);
};

// console.log(new Signature(1, a => "a"));


var lengthFilterWithOverloads = function lengthFilterWithOverloads(filterBase) {
  var filter = withOverload(filterBase, false);

  filter.overloads.add({
    signature: new Signature(TYPES.ARRAY),
    method: function method(array) {
      return array.filter(function (obj) {
        return obj.length >= 5;
      });
    }
  }).add({
    signature: new Signature(TYPES.FUNCTION),
    method: function method(obj) {
      return obj.length >= 5;
    }
  });

  return filter;
};

var testArray = ["apple", "bear", "twentytwo", "a"];

var SignedFilter = new SignedFunction({
  signature: new Signature(TYPES.ANY, TYPES.NUMBER, TYPES.ARRAY),
  method: function method(item, index, originalArray) {
    return item;
  }
});

//const filter2 = lengthFilterWithOverloads(identity);
var filter = lengthFilterWithOverloads(SignedFilter);

// console.log('filter2 ---------');
// console.log(filter2);
// console.log('----------------');
// console.log('----------------');
//
// console.log('filter ---------');
// console.log(filter);
// console.log('----------------');

//filter(testArray);        // args => ["apple", ....]
var omgItWorked = testArray.filter(filter); // args => [ "apple", 0, ["apple", "bear"... ] ] -- ie .filters
// arguments
// console.log(filter(testArray));
// console.log(testArray.filter(filter));

console.log(omgItWorked);