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

function Overload({ signature, method, pipe = null }) {
  this.signature = ( signature instanceof Signature ) ? signature : new Signature(...signature);

  this.method = new Proxy(method, pipeHandler);

  this.getSignature = () => signature;
  this.shouldPipe = pipe;

  this.getPipedOutput = (...allArguments) => this.method(...allArguments).PIPE;
  this.toString = () => signature.toString();
}


const matchByStructure = signature => keySignature => keySignature.equals(signature);
const byLength = length => signature => signature.length === length;
const whetherTypesMatch = signature => (type, index) => {
  const typeOne = type;
  const typeTwo = signature.structure[index];
  return typeOne === typeTwo || typeOne === TYPES.ANY || typeTwo === TYPES.ANY;
};

const matchWithAnyFound = (signature, signaturesWithAny) => {
  const whereAllTypesMatchOrAny =
    wildcard => wildcard.structure.every(whetherTypesMatch(signature));

  return signaturesWithAny
    .filter(byLength(signature.length))
    .find(whereAllTypesMatchOrAny);
};

export const withOverload = (someFunction, allowDefault = true) => {

  if (!someFunction) {
    someFunction = x => x;
  }

  const self = someFunction;
  const calls = new Map();
  const signatures = () => {
    return getMapKeys(calls);
  };

  const allTypes = new Set();

  self.overloads = {
    all: calls,
    add: ({ signature, method, pipe }) => {
      const overload = new Overload({ signature, method, pipe });
      calls.set(overload.getSignature(), overload);
      allTypes.add(...overload.getSignature().structure);
      return self.overloads;
    },
  };


  self.hasSignaturesOfLength = length => signatures().find(byLength(length));
  self.getSignaturesOfLength = length => signatures().filter(byLength(length));
  self.getSignaturesWithAny = () => signatures().filter(signature => signature.allowsAny);

  self.shouldCheckBoxes = () => signatures().find(signature => signature.needsBoxCheck);
  self.allowsAny = () => self.getSignaturesWithAny().length !== 0;

  self.hasOverloadFor = signature => mapToString(signatures()).includes(signature.toString());
  self.doesNotHaveOverloadFor = signature => !self.hasOverloadFor(signature);

  const getOverload = (calls, signature) => {

    const matchingKey = signatures().find(matchByStructure(signature));
    if (matchingKey === undefined) {
      throw new NoSuchSignatureError(signature);
    }

    return calls.get(matchingKey);
  };

  self.getNextBestMatch = signature => {
    if (self.allowsAny()) {
      const maybeSignature =
        matchWithAnyFound(signature, self.getSignaturesWithAny());

      if (maybeSignature) {
        return getOverload(calls, maybeSignature);
      }
    }

    if (allowDefault) {
      return self;
    }
  };

  self.getOverloadByArguments = allArguments => {
    let overload;

    let signature = new Signature(...allArguments);
    const mustBeExactMatch = !self.allowsAny() && !allowDefault;
    const hasAllowedArgumentCount = self.hasSignaturesOfLength(allArguments.length);

    if (!hasAllowedArgumentCount) {
      throw new NoSignatureOfLengthError(signature, self);
    }

    if (self.hasOverloadFor(signature)) {
      overload = getOverload(calls, signature);
    } else {
      if (mustBeExactMatch) {
        throw new NoSuchSignatureError(signature, self);
      }

      overload = self.getNextBestMatch(signature);
    }

    if (overload) {
      return overload;
    } else {
      throw new NoSuchSignatureError(signature, self);
    }

  };

  const overloadedCallHandler = {
    apply: function (target, thisArg, allArguments) {
      try {
        let matchingOverload = target.getOverloadByArguments(allArguments);
        let realArguments = allArguments;

        while (matchingOverload.shouldPipe) {
          realArguments = matchingOverload.getPipedOutput(target, ...realArguments);
          matchingOverload = target.getOverloadByArguments(realArguments);
        }

        return matchingOverload.method(target, ...realArguments);
      } catch (someOverloadingError) {
        console.log('caught');
      }
    }
  };

  return new Proxy(self, overloadedCallHandler);
};