import { hasKey, getMapKeys } from './manipulations';

const VOID = (() => {
})();

const TYPES = {
  STRING: (typeof "apple"),
  NUMBER: (typeof 15),
  BOOLEAN: (typeof true),
  ARRAY: ([].constructor.name),
  VOID: '<VOID>',
  NULL: '<NULL>',
  FUNCTION: 'FUNCTION',
  UNDEFINED: '<UNDEFINED>',
  ANY: '<ANY>'
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
      return isConstructor(param) ? "FUNCTION" : param.name;
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

  // this.key = this.signature.toString();
  this.key = this.signature;
  this.shouldPipe = pipe;
  this.method = new Proxy(method, pipeHandler);
  this.getPipedOutput = (...allArguments) => this.method(...allArguments).PIPE;
  this.toString = this.signature.toString();
}

function SignatureError(signature, message) {
  this.name = 'SignatureError';
  this.message = `No function matching signature <${signature}> found.`;
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
    console.log(self.calls.keys());
    self.calls.set(overload.key, overload);
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
    self.overloads.add({ signature: someFunction.signature, method: someFunction.method });
  }

  self.getOverload = signature => {
    const keys = getMapKeys(self.calls);

    const matchByStructure = keySignature => keySignature.equals(signature);

    const matchingKey = keys.find(matchByStructure);

    return self.calls.get(matchingKey);
  };

  self.getSignatures = () => getMapKeys(self.calls);

  self.hasOverloadFor = signature => self.getSignatures().map(key => key.toString()).includes(signature.toString());
  self.doesNotHaveOverloadFor = signature => !self.hasOverloadFor(signature);

  self.getOverloadByArguments = allArguments => {
    const signature = new Signature(...allArguments);

    if (self.doesNotHaveOverloadFor(signature)) {
      if (allowDefault) {
        return self(...allArguments);
      }
      throw new SignatureError(signature);
    }

    return self.getOverload(signature);
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


const filterWithOverloads = filterBase => {
  const filter = withOverload(filterBase, false);

  filter.overloads
        .add({
          signature: new Signature(TYPES.ARRAY),
          method: array => array.filter(obj => obj.length >= 5),
        })
        .add({
          signature: new Signature(TYPES.FUNCTION),
          method: obj => obj.length >= 5
        })
  ;

  return filter;
};

const testArray = ["apple", "bear", "twentytwo", "a"];

const SignedFilter = new SignedFunction({
  signature: new Signature(TYPES.ANY, TYPES.NUMBER, TYPES.ARRAY),
  method: (item, index, originalArray) => item
});

//const filter2 = filterWithOverloads(identity);
const filter = filterWithOverloads(SignedFilter);


// console.log('filter2 ---------');
// console.log(filter2);
// console.log('----------------');
// console.log('----------------');
//
// console.log('filter ---------');
// console.log(filter);
// console.log('----------------');

//filter(testArray);        // args => ["apple", ....]
//testArray.filter(filter); // args => [ "apple", 0, ["apple", "bear"... ] ] -- ie .filters arguments
// console.log(filter(testArray));
// console.log(testArray.filter(filter));
