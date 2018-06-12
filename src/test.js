import { getMapKeys, mapToString } from './manipulations';
import { NoSignatureOfLengthError, NoSuchSignatureError, Signature, TYPES } from "./Signature";


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
  this.shouldPipe = pipe;

  this.getPipedOutput = (...allArguments) => {
    return this.method(...allArguments).PIPE
  };

  this.toString = () => this.signature.toString();
}


const withOverload = (someFunction, allowDefault = true) => {

  if (!someFunction) {
    someFunction = x => x;
  }

  const self = someFunction;

  self.calls = new Map();

  self.ownName = self.name ? self.name : "<lambda>";

  self.overload = ({ signature, method, pipe }) => {
    const overload = new Overload({ signature, method, pipe });
    self.calls.set(overload.signature, overload);
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

  self.hasSignaturesOfNumber = number => self.getSignatures().find(signature => signature.length === number);
  self.getSignaturesOfNumber = number => self.getSignatures().filter(signature => signature.length === number);

  self.hasOverloadFor = signature => self.getStringSignatures().includes(signature.toString());
  self.doesNotHaveOverloadFor = signature => !self.hasOverloadFor(signature);

  const matchWithAnyFound = signature => {
    return self.getSignaturesWithAny()
               .filter(wildcardSignature => wildcardSignature.length === signature.length)
               .find(wildcardSignature => {
                 let allTypesMatch = false;
                 const sameType = (typeOne, typeTwo) => typeOne === typeTwo || typeOne === TYPES.ANY || typeTwo === TYPES.ANY;

                 wildcardSignature.structure.map((type, index) => {
                   return sameType(type, signature.structure[index]);
                 }).reduce((isTrueSoFar, maybeTrue) => isTrueSoFar && maybeTrue, true);

                 return allTypesMatch;
               })
      ;
  };

  self.getOverloadByArguments = allArguments => {
    let signature = new Signature(...allArguments);
    const hasAllowedArgumentCount = self.hasSignaturesOfNumber(allArguments.length);
    const mustBeExactMatch = !self.allowsAny() && !self.allowsDefault;

    if (!hasAllowedArgumentCount) {
      throw new NoSignatureOfLengthError(signature, self);
    }

    let overload;

    if (self.doesNotHaveOverloadFor(signature)) {
      if (mustBeExactMatch) {
        throw new NoSuchSignatureError(signature, self);
      }

      if (self.allowsAny()) {
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

const identity = x => x;
const bob = withOverload(identity);

function Test() {}

const testObject = new Test();

bob.overloads
   .add({
     signature: new Signature("a", 1),
     method: (a, b) => [b, a],
     pipe: true
   })
   .add({
     signature: new Signature(1, "a"),
     method: (a, b) => `${a} ${b}`
   })
   .add({
     signature: new Signature("a", 1, "c"),
     method: (a, b, c) => [`${a}${c}`, b],
     pipe: true
   })
   .add({
     signature: new Signature(testObject),
     method: a => [1, 'hello'],
     pipe: true
   })
   .add({
     signature: new Signature(),
     method: () => "apple"
   })
   .add({
     signature: new Signature(TYPES.ANY),
     method: (bob) => "apple"
   })
;


console.log(bob(10, "apple")); // 10 apple
console.log("----------");

console.log(bob("orange", 12)); // 12 orange
console.log("----------");

console.log(bob("red", 55, "green")); // 55 redgreen
console.log("----------");

const lengthFilterWithOverloads = filterBase => {
  const filter = withOverload(filterBase.method, false);

  filter.overloads
        .add({
          signature: new Signature(TYPES.ARRAY),
          method: array => array.filter(obj => obj.length >= 5),
        })
        .add({
          signature: new Signature(TYPES.NUMBER),
          method: number => [((obj) => {
            return obj.length >= number
          })]
          , pipe: true
        })
        .add({
          signature: new Signature(TYPES.LAMBDA),
          method: filterFunction => filterFunction
        })
  ;

  return filter;
};

const testArray = ["apple", "bear", "twentytwo", "a"];

const filter = lengthFilterWithOverloads(identity);

const omgItWorked = testArray.filter(filter(5));

console.log(omgItWorked);
