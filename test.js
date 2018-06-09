//import * as Helper from './manipulations';

const TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  ARRAY: 'array'
};

const TEST_STRING_ARRAY = ["string", "string"];


const switchOnConstructorName = (param) => {
  const constructorName = param.constructor.name;
  console.log(param);
  switch (constructorName) {
    case 'Array':
      return TYPES.ARRAY;
    case 'Object':
      return `{${Object.keys(param).map(key => `${key}:${switchOnTypeof(param[key])}`).join()}}`;
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

Signature.prototype = Object.create(Signature);


function Overload({ signature, method, pipe = false }) {
  const self = this;

  this.signature = (signature instanceof Signature) ? signature : new Signature(...signature);

  this.key = this.signature.toString();
  this.shouldPipe = pipe;

  const pipeHandler = {
    apply: function(target, thisArg, argumentList) {
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

  const self = someFunction;
  someFunction.calls = new Map();
  someFunction.name = self.name ? self.name : "<lambda>";

  someFunction.overload = ({ signature, method }) => {
    const overload = new Overload({ signature, method });
    someFunction.calls.set(overload.key, overload);
    return self;
  };

  someFunction.overloads = {
    all: self.calls,
    add: (...inputOverload) => {
      self.overload(inputOverload);
      return self;
    },
  };


  // now we hijack the main call....
  transformedFunctionCall = (...arguments) => {
    const signature = getSimpleSignature(...arguments);
    console.log(signature);

    if (!someFunction.calls.has(signature)) {
      if (allowDefault) {
        return someFunction(...arguments);
      }
      throw new SignatureError(signature);
    }

    const enclosingFunction = someFunction;
    const matchingOverload = someFunction.calls.get(signature);

    return matchingOverload.method(enclosingFunction, ...arguments);
  };

  const handler = {
    apply: function (target, thisArg, argumentList) {
      return transformedFunctionCall(...argumentList);
    }
  };

  return new Proxy(someFunction, handler);
};

const identity = x => x;
const bob = withOverload(identity);

bob.overload({ signature: new Signature(new Map(), 2), method: (a, b) => a + 100 })
.overload({ signature: new Signature(1, 2), method: (a, b) => a + 100 })
.overload({ signature: new Signature([1], 2), method: (a, b) => a + 100 })
.overload({ signature: new Signature({ apple: 5, testing: [1,2,3], wobble: { orange: 5} }, 2), method: (a, b) => a + 100 })
.overload({ signature: [1, 2], method: (a, b) => a + b })
.overload({ signature: ["a", "b"], method: (a, b) => `${a}.${b}` })
.overload({ signature: TEST_STRING_ARRAY, method: () => 45 });

// console.log(bob.calls);
console.log(bob());
console.log(bob(3,3));
console.log(bob("x", "ssssb"));
console.log(bob(["aa", "bdddd"]));
