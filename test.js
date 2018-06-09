//import * as Helper from './manipulations';

const TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  ARRAY: 'array'
};

const TEST_STRING_ARRAY = ["string", "string"];

const reduceObjectToSignature = someObject =>
  Object.keys(someObject)
        .map(key => `${key}:${switchOnTypeof(someObject[key])}`)
        .join();

const switchOnConstructorName = (param) => {
  const constructorName = param.constructor.name;
  console.log(param);
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
  const paramType = typeof param;
  switch (paramType) {
    case 'string':
      return TYPES.STRING;
    case 'number':
      return TYPES.NUMBER;
    case 'boolean':
      return TYPES.BOOLEAN;
    case 'function':
      return getSimpleSignature(param);
    default:
      return switchOnConstructorName(param);
  }
};

const mapTypes = (parameters) => parameters.map(switchOnTypeof);

const getSimpleSignature = (...parameters) => {
  return mapTypes(parameters).join();
};

function Signature(...parameters) {
  Signature.void = "";

  this.structure = mapTypes(parameters);
  this.toString = () => `${getSimpleSignature(...parameters)}`;
  this.number = parameters.length;
  this.types = Array.from(new Set(parameters));

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


function Overload({ signature, method, pipe = null }) {
  const self = this;

  this.signature = (signature instanceof Signature) ? signature : new Signature(...signature);

  this.key = this.signature.toString();
  this.shouldPipe = pipe;

  const pipeHandler = {
    apply: function (target, thisArg, argumentList) {
      const functionWithOverloads = argumentList.shift();
      const resultOfCurrentCall = target(...argumentList);

      if (self.shouldPipe) {
        return functionWithOverloads({ PIPE: resultOfCurrentCall });
      } else {
        return resultOfCurrentCall;
      }

    }
  };

  this.method = new Proxy(method, pipeHandler);

  this[Symbol.iterator] = function* () {
    yield signature;
    yield method;
    yield pipeTo;
  };

  this.toString = this.signature.toString();
}

/*
<ClassName>
Array
Number
Function
Object
*/

function SignatureError(signature, message) {
  this.name = 'SignatureError';
  this.message = `No function matching signature <${signature}> found.`;
}


const withOverload = (someFunction, allowDefault = true) => {

  if (!someFunction) {
    someFunction = x => x;
  }

  const self = someFunction;
  someFunction.calls = new Map();
  someFunction.name = self.name ? self.name : "<lambda>";

  someFunction.overload = ({ signature, method, pipe }) => {
    const overload = new Overload({ signature, method, pipe });
    someFunction.calls.set(overload.key, overload);
    return self;
  };

  someFunction.overloads = {
    all: self.calls,
    add: (...inputOverload) => {
      self.overload(...inputOverload);

      return self.overloads;
    },
  };

  someFunction.getOverload = signature => someFunction.calls.get(signature);
  someFunction.getOverloadByArguments = arguments => {
    const signature = getSimpleSignature(...arguments);

    if (!someFunction.calls.has(signature)) {
      if (allowDefault) {
        return someFunction(...arguments);
      }

      throw new SignatureError(signature);
    }

    return someFunction.getOverload(signature);
  };

  // now we hijack the main call....
  const handler = {
    apply: function (target, thisArg, arguments) {
      let matchingOverload = someFunction.getOverloadByArguments(arguments);

      let realArguments = arguments;

      while (matchingOverload.shouldPipe) {
        const resultToPipe = matchingOverload.method(someFunction, ...realArguments);

        realArguments = resultToPipe.PIPE;

        matchingOverload = someFunction.getOverload(getSimpleSignature(...realArguments));
      }

      return matchingOverload.method(someFunction, ...realArguments);
    }
  };

  return new Proxy(someFunction, handler);
};

const identity = x => x;
const bob = withOverload(identity, false);

bob.overloads
   .add({
     signature: new Signature(1, "a"),
     method: (a, b) => `${a} ${b}`
   })

   .add({
     signature: new Signature("a", 1),
     method: (a, b) => [b, a],
     pipe: true
   })

   .add({
     signature: new Signature("a", 1, "c"),
     method: (a, b, c) => [`${a}${c}`, b],
     pipe: true
   })
;

console.log(bob(10, "apple")); // 10 apple
console.log("----------");

console.log(bob("orange", 12)); // 12 orange
console.log("----------");

console.log(bob("red", 55, "green")); // 55 redgreen
console.log("----------");