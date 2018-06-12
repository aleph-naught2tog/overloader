"use strict";

var _manipulations = require("./manipulations");

var _Signature = require("./Signature");

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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

var overloadedCallHandler = {
  apply: function apply(target, thisArg, allArguments) {
    var _matchingOverload2;

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

function Overload(_ref) {
  var _this = this;

  var signature = _ref.signature,
      method = _ref.method,
      _ref$pipe = _ref.pipe,
      pipe = _ref$pipe === undefined ? null : _ref$pipe;

  this.signature = signature instanceof _Signature.Signature ? signature : new (Function.prototype.bind.apply(_Signature.Signature, [null].concat(_toConsumableArray(signature))))();

  this.method = new Proxy(method, pipeHandler);
  this.shouldPipe = pipe;

  this.getPipedOutput = function () {
    return _this.method.apply(_this, arguments).PIPE;
  };

  this.toString = function () {
    return _this.signature.toString();
  };
}

var withOverload = function withOverload(someFunction) {
  var allowDefault = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;


  if (!someFunction) {
    someFunction = function someFunction(x) {
      return x;
    };
  }

  var self = someFunction;

  self.calls = new Map();

  self.ownName = self.name ? self.name : "<lambda>";

  self.overload = function (_ref2) {
    var signature = _ref2.signature,
        method = _ref2.method,
        pipe = _ref2.pipe;

    var overload = new Overload({ signature: signature, method: method, pipe: pipe });
    self.calls.set(overload.signature, overload);
    return self;
  };

  self.overloads = {
    all: self.calls,
    add: function add() {
      self.overload.apply(self, arguments);
      return self.overloads;
    }
  };

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
      throw new _Signature.NoSuchSignatureError(signature);
    }

    return self.calls.get(matchingKey);
  };

  self.hasSignaturesOfNumber = function (number) {
    return self.getSignatures().find(function (signature) {
      return signature.length === number;
    });
  };
  self.getSignaturesOfNumber = function (number) {
    return self.getSignatures().filter(function (signature) {
      return signature.length === number;
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
      return wildcardSignature.length === signature.length;
    }).find(function (wildcardSignature) {
      var allTypesMatch = false;
      var sameType = function sameType(typeOne, typeTwo) {
        return typeOne === typeTwo || typeOne === _Signature.TYPES.ANY || typeTwo === _Signature.TYPES.ANY;
      };

      wildcardSignature.structure.map(function (type, index) {
        return sameType(type, signature.structure[index]);
      }).reduce(function (isTrueSoFar, maybeTrue) {
        return isTrueSoFar && maybeTrue;
      }, true);

      return allTypesMatch;
    });
  };

  self.getOverloadByArguments = function (allArguments) {
    var signature = new (Function.prototype.bind.apply(_Signature.Signature, [null].concat(_toConsumableArray(allArguments))))();
    var hasAllowedArgumentCount = self.hasSignaturesOfNumber(allArguments.length);
    var mustBeExactMatch = !self.allowsAny() && !self.allowsDefault;

    if (!hasAllowedArgumentCount) {
      throw new _Signature.NoSignatureOfLengthError(signature, self);
    }

    var overload = void 0;

    if (self.doesNotHaveOverloadFor(signature)) {
      if (mustBeExactMatch) {
        throw new _Signature.NoSuchSignatureError(signature, self);
      }

      if (self.allowsAny()) {
        var maybeSignature = matchWithAnyFound(signature);
        if (maybeSignature) {
          overload = self.getOverload(maybeSignature);
        }
      } else if (self.allowsDefault) {
        overload = self.apply(undefined, _toConsumableArray(allArguments));
      }
    }

    if (self.hasOverloadFor(signature)) {
      overload = self.getOverload(signature);
    }

    if (overload) {
      return overload;
    } else {
      throw new Error("Something has gone very wrong.");
    }
  };

  return new Proxy(self, overloadedCallHandler);
};

var identity = function identity(x) {
  return x;
};
var bob = withOverload(identity);

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
    return "apple";
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

var lengthFilterWithOverloads = function lengthFilterWithOverloads(filterBase) {
  var filter = withOverload(filterBase.method, false);

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