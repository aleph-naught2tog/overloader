import { NoSignatureOfLengthError, NoSuchSignatureError, Signature, TYPES } from "./Signature";
import { getMapKeys, mapToString } from "./manipulations";

const pipeHandler = {
  apply: function (target, self, argumentList) {
    const functionWithOverloads = argumentList.shift();
    const resultOfCurrentCall = target(...argumentList);

    if (self.shouldPipe) {
      return functionWithOverloads({ PIPE: resultOfCurrentCall });
    } else {
      return resultOfCurrentCall;
    }
  }
};
const overloadedCallHandler = {
  apply: function (target, thisArg, allArguments) {
    let matchingOverload = target.getOverloadByArguments(allArguments);
    let realArguments = allArguments;

    while (matchingOverload.shouldPipe) {
      realArguments = matchingOverload.getPipedOutput(target, ...realArguments);
      matchingOverload = target.getOverloadByArguments(realArguments);
    }

    return matchingOverload.method(target, ...realArguments);
  }
};

function Overload({ signature, method, pipe = null }) {
  this.signature = (signature instanceof Signature) ? signature : new Signature(...signature);

  this.method = new Proxy(method, pipeHandler);

  this.getSignature = () => signature;
  this.shouldPipe = pipe;

  this.getPipedOutput = (...allArguments) => this.method(...allArguments).PIPE;
  this.toString = () => signature.toString();
}

export const withOverload = (someFunction, allowDefault = true) => {

  if (!someFunction) {
    someFunction = x => x;
  }

  const self = someFunction;

  self.calls = new Map();

  self.ownName = self.name ? self.name : "<lambda>";

  self.overload = ({ signature, method, pipe }) => {
    const overload = new Overload({ signature, method, pipe });
    self.calls.set(overload.getSignature(), overload);
    return self;
  };

  self.overloads = {
    all: self.calls,
    add: (...inputOverload) => {
      self.overload(...inputOverload);
      return self.overloads;
    },
  };

  self.getSignatures = () => getMapKeys(self.calls);
  self.getStringSignatures = () => mapToString(self.getSignatures());

  self.allowsDefault = allowDefault;
  self.getSignaturesWithAny = () => self.getSignatures().filter(signature => signature.allowsAny);

  self.allowsAny = () => self.getSignaturesWithAny().length !== 0;

  self.getOverload = signature => {
    const matchByStructure = keySignature => keySignature.equals(signature);
    const matchingKey = self.getSignatures().find(matchByStructure);

    if (matchingKey === undefined) {
      throw new NoSuchSignatureError(signature);
    }

    return self.calls.get(matchingKey);
  };

  const byLength = length => signature => signature.length === length;
  const whetherTypesMatch = signature => (type, index) => {
    const typeOne = type;
    const typeTwo = signature.structure[index];
    return typeOne === typeTwo || typeOne === TYPES.ANY || typeTwo === TYPES.ANY;
  };

  self.hasSignaturesOfLength = length => self.getSignatures().find(byLength(length));
  self.getSignaturesOfLength = length => self.getSignatures().filter(byLength(length));

  self.hasOverloadFor = signature => self.getStringSignatures().includes(signature.toString());
  self.doesNotHaveOverloadFor = signature => !self.hasOverloadFor(signature);

  const matchWithAnyFound = signature => {

    const whereAllTypesMatchOrAny = wildcard =>
      wildcard.structure.every(whetherTypesMatch(signature));

    return self.getSignaturesWithAny()
               .filter(byLength(signature.length))
               .find(whereAllTypesMatchOrAny);
  };

  self.getOverloadByArguments = allArguments => {
    let signature = new Signature(...allArguments);
    const hasAllowedArgumentCount = self.hasSignaturesOfLength(allArguments.length);
    const mustBeExactMatch = !self.allowsAny() && !self.allowsDefault;

    if (!hasAllowedArgumentCount) {
      throw new NoSignatureOfLengthError(signature, self);
    }

    let overload;

    if (self.doesNotHaveOverloadFor(signature)) {
      if (mustBeExactMatch) {
        throw new NoSuchSignatureError(signature, self);
      } else if (self.allowsAny()) {
        const maybeSignature = matchWithAnyFound(signature);
        if (maybeSignature) {
          overload = self.getOverload(maybeSignature);
        }
      } else if (self.allowsDefault) {
        overload = self(...allArguments);
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