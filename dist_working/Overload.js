"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.withOverload = undefined;

var _Signature = require("./Signature");

var _manipulations = require("./manipulations");

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

function Overload(_ref) {
  var _this = this;

  var signature = _ref.signature,
      method = _ref.method,
      _ref$pipe = _ref.pipe,
      pipe = _ref$pipe === undefined ? null : _ref$pipe;

  this.signature = signature instanceof _Signature.Signature ? signature : new (Function.prototype.bind.apply(_Signature.Signature, [null].concat(_toConsumableArray(signature))))();

  this.method = new Proxy(method, pipeHandler);

  this.getSignature = function () {
    return signature;
  };
  this.shouldPipe = pipe;

  this.getPipedOutput = function () {
    return _this.method.apply(_this, arguments).PIPE;
  };
  this.toString = function () {
    return signature.toString();
  };
}

var matchByStructure = function matchByStructure(signature) {
  return function (keySignature) {
    return keySignature.equals(signature);
  };
};
var byLength = function byLength(length) {
  return function (signature) {
    return signature.length === length;
  };
};
var whetherTypesMatch = function whetherTypesMatch(signature) {
  return function (type, index) {
    var typeOne = type;
    var typeTwo = signature.structure[index];
    return typeOne === typeTwo || typeOne === _Signature.TYPES.ANY || typeTwo === _Signature.TYPES.ANY;
  };
};

var matchWithAnyFound = function matchWithAnyFound(signature, signaturesWithAny) {
  var whereAllTypesMatchOrAny = function whereAllTypesMatchOrAny(wildcard) {
    return wildcard.structure.every(whetherTypesMatch(signature));
  };

  return signaturesWithAny.filter(byLength(signature.length)).find(whereAllTypesMatchOrAny);
};

var withOverload = exports.withOverload = function withOverload(someFunction) {
  var allowDefault = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;


  if (!someFunction) {
    someFunction = function someFunction(x) {
      return x;
    };
  }

  var self = someFunction;
  var calls = new Map();
  var signatures = function signatures() {
    return (0, _manipulations.getMapKeys)(calls);
  };

  var allTypes = new Set();

  self.overloads = {
    all: calls,
    add: function add(_ref2) {
      var signature = _ref2.signature,
          method = _ref2.method,
          pipe = _ref2.pipe;

      var overload = new Overload({ signature: signature, method: method, pipe: pipe });
      calls.set(overload.getSignature(), overload);
      allTypes.add.apply(allTypes, _toConsumableArray(overload.getSignature().structure));
      return self.overloads;
    }
  };

  self.hasSignaturesOfLength = function (length) {
    return signatures().find(byLength(length));
  };
  self.getSignaturesOfLength = function (length) {
    return signatures().filter(byLength(length));
  };
  self.getSignaturesWithAny = function () {
    return signatures().filter(function (signature) {
      return signature.allowsAny;
    });
  };

  self.shouldCheckBoxes = function () {
    return signatures().find(function (signature) {
      return signature.needsBoxCheck;
    });
  };
  self.allowsAny = function () {
    return self.getSignaturesWithAny().length !== 0;
  };

  self.hasOverloadFor = function (signature) {
    return (0, _manipulations.mapToString)(signatures()).includes(signature.toString());
  };
  self.doesNotHaveOverloadFor = function (signature) {
    return !self.hasOverloadFor(signature);
  };

  var getOverload = function getOverload(calls, signature) {

    var matchingKey = signatures().find(matchByStructure(signature));
    if (matchingKey === undefined) {
      throw new _Signature.NoSuchSignatureError(signature);
    }

    return calls.get(matchingKey);
  };

  self.getNextBestMatch = function (signature) {
    if (self.allowsAny()) {
      var maybeSignature = matchWithAnyFound(signature, self.getSignaturesWithAny());

      if (maybeSignature) {
        return getOverload(calls, maybeSignature);
      }
    }

    if (allowDefault) {
      return self.apply(undefined, _toConsumableArray(allArguments));
    }
  };

  self.getOverloadByArguments = function (allArguments) {
    var overload = void 0;

    var signature = new (Function.prototype.bind.apply(_Signature.Signature, [null].concat(_toConsumableArray(allArguments))))();
    var mustBeExactMatch = !self.allowsAny() && !allowDefault;
    var hasAllowedArgumentCount = self.hasSignaturesOfLength(allArguments.length);

    if (!hasAllowedArgumentCount) {
      throw new _Signature.NoSignatureOfLengthError(signature, self);
    }
    //
    // if (self.shouldCheckBoxes()) {
    //   console.log(mapTypesForBoxing(allArguments));
    //   return;
    // }


    if (self.hasOverloadFor(signature)) {
      overload = getOverload(calls, signature);
    } else {
      if (mustBeExactMatch) {
        throw new _Signature.NoSuchSignatureError(signature, self);
      }

      overload = self.getNextBestMatch(signature);
    }

    if (overload) {
      return overload;
    } else {
      throw new _Signature.NoSuchSignatureError(signature, self);
    }
  };

  var overloadedCallHandler = {
    apply: function apply(target, thisArg, allArguments) {
      try {
        var _matchingOverload2;

        var matchingOverload = target.getOverloadByArguments(allArguments);
        var realArguments = allArguments;

        while (matchingOverload.shouldPipe) {
          var _matchingOverload;

          realArguments = (_matchingOverload = matchingOverload).getPipedOutput.apply(_matchingOverload, [target].concat(_toConsumableArray(realArguments)));
          matchingOverload = target.getOverloadByArguments(realArguments);
        }

        return (_matchingOverload2 = matchingOverload).method.apply(_matchingOverload2, [target].concat(_toConsumableArray(realArguments)));
      } catch (someOverloadingError) {
        console.log('caught');
      }
    }
  };

  return new Proxy(self, overloadedCallHandler);
};