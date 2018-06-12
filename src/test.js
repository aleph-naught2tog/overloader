import { hasKey, getMapKeys, mapToString, filterMap } from './manipulations';

const VOID = (() => {
})();

const TYPES = {
  STRING: (typeof "apple"),
  NUMBER: (typeof 15),
  BOOLEAN: (typeof true),
  ARRAY: ([].constructor.name),
  VOID: '<VOID>',
  NULL: '<NULL>',
  CONSTRUCTOR: '<CONSTRUCTOR>',
  FUNCTION: 'FUNCTION',
  UNDEFINED: '<UNDEFINED>',
  ANY: '<ANY>',
  LAMBDA: '<LAMBDA>'
};

const reduceObjectToSignature = someObject =>
  Object.keys(someObject)
        .map(key => `${key}:${switchOnTypeof(someObject[key])}`)
        .join();

const isConstructor = param => {
  let isConstructor = false;

  try {
    param();
  } catch (error) {
    if (error.message.indexOf("class constructors must be invoked") >= 0) {
      isConstructor = true;
    }
  }

  return isConstructor;
};

const switchOnConstructorName = (param) => {
  const constructorName = param.constructor.name;
  switch (constructorName) {
    case 'Array':
      return TYPES.ARRAY;
    case 'Object':
      return `{${reduceObjectToSignature(param)}}`;
    default:
      return constructorName;
  }
};

const switchOnTypeof = (param) => {
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

  const paramType = typeof param;
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

export const mapTypes = (parameters) => parameters.map(switchOnTypeof);

const getSimpleSignature = (...parameters) => {
  return `${mapTypes(parameters).join()}`;
};

function Signature(...parameters) {
  this.structure = mapTypes(parameters);
  this.allowsAny = this.structure.includes(TYPES.ANY);
  this.toString = () => getSimpleSignature(...parameters);
  this.number = parameters.length;
  this.equals = (otherSignature) => {
    let result = false;
    if (otherSignature instanceof Signature) {
      if (otherSignature.number === this.number) {
        result = this.structure.every(
          (currentParameter, index) => currentParameter === otherSignature.structure[index]
        );
      }
    }
    return result;
  };
}


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
  const self = this;

  this.signature = (signature instanceof Signature) ? signature : new Signature(...signature);

  this.shouldPipe = pipe;
  this.method = new Proxy(method, pipeHandler);
  this.getPipedOutput = (...allArguments) => {
    return this.method(...allArguments).PIPE
  };
  this.toString = this.signature.toString();
}

function NoSuchSignatureError(signature, overloadedFunction) {
  this.name = 'NoSuchSignatureError';
  this.message = `No function matching signature <${signature}> found.
Did you mean:
    ${overloadedFunction.getSignatures().map(signature => signature.toString())}
`;
}

function NoSignatureOfLengthError(signature, overloadedFunction) {
  this.name = 'NoSignatureOfLengthError';
  this.message = `No function with a signature <${signature}> of length ${signature.number} was found.
Did you mean:
    ${overloadedFunction.getSignaturesOfNumber(signature.number).map(signature => `* ${signature.toString()}`)}`;
}

function SignedFunction({ signature, method }) {
  this.signature = signature;
  this.method = method;
}

const withOverload = (someFunction, allowDefault = true) => {

  if (!someFunction) {
    someFunction = x => x;
  }

  let self;

  if (someFunction instanceof SignedFunction) {
    self = someFunction.method;
  } else {
    self = someFunction;
  }

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

  if (someFunction instanceof SignedFunction) {
    self.overloads.add({
      signature: someFunction.signature,
      method: someFunction.method
    });
  }


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

  self.hasSignaturesOfNumber = number => self.getSignatures().find(signature => signature.number === number);
  self.getSignaturesOfNumber = number => self.getSignatures().filter(signature => signature.number === number);

  self.hasOverloadFor = signature => self.getStringSignatures().includes(signature.toString());
  self.doesNotHaveOverloadFor = signature => !self.hasOverloadFor(signature);

  const matchWithAnyFound = signature => {
    return self.getSignaturesWithAny()
               .filter(wildcardSignature => wildcardSignature.number === signature.number)
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

  // now we hijack the main call....
  const handler = {
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

  return new Proxy(self, handler);
};

const identity = x => x;
const bob = withOverload(identity);

function Test() {
}

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
//
// console.log(bob(testObject));
// console.log(bob());

// will this blow up?

const overloadedFilter = filter => withOverload(filter);

// console.log(new Signature(1, a => "a"));


const lengthFilterWithOverloads = filterBase => {
  const filter = withOverload(filterBase.method, false);

  filter.overloads
        .add({
          signature: new Signature(TYPES.ARRAY),
          method: array => array.filter(obj => obj.length >= 5),
        })
        .add({
          signature: new Signature(TYPES.NUMBER),
          method: number => [((obj, i, a) => {
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

const SignedFilter = new SignedFunction({
  signature: new Signature(TYPES.FUNCTION),
  method: filterFunction => filterFunction
});

//const filter2 = lengthFilterWithOverloads(identity);
const filter = lengthFilterWithOverloads(identity);
console.log("......");
console.log(getMapKeys(filter.calls).map(key => key.toString()));

// console.log('filter2 ---------');
// console.log(filter2);
// console.log('----------------');
// console.log('----------------');
//
// console.log('filter ---------');
// console.log(filter);
// console.log('----------------');

//filter(testArray);        // args => ["apple", ....]
const omgItWorked = testArray.filter(filter(5)); // args => [ "apple", 0, ["apple", "bear"... ] ] -- ie .filters
// arguments
// console.log(filter(testArray));
// console.log(testArray.filter(filter));

console.log(omgItWorked);
