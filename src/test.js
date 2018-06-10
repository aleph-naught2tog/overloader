import { hasKey } from './manipulations';

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


const asOptional = param => {
};
const withDefault = param => param || defaultValue;


const TEST_STRING_ARRAY = ["string", "string"];

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
    // return getSimpleSignature(param);
    default:
      return switchOnConstructorName(param);
  }
};

const mapTypes = (parameters) => parameters.map(switchOnTypeof);

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

  this.key = this.signature.toString();
  this.shouldPipe = pipe;

  this.method = new Proxy(method, pipeHandler);

  this.getPipedOutput = (...allArguments) => this.method(...allArguments).PIPE;

  this.toString = this.signature.toString();
}

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
  someFunction.ownName = self.name ? self.name : "<lambda>";

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
  someFunction.getOverloadByArguments = allArguments => {
    const signature = getSimpleSignature(...allArguments);

    if (!someFunction.calls.has(signature)) {
      if (allowDefault) {
        return someFunction(...allArguments);
      }

      throw new SignatureError(signature);
    }

    return someFunction.getOverload(signature);
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

  return new Proxy(someFunction, handler);
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

//
// console.log(bob(10, "apple")); // 10 apple
// console.log("----------");
//
// console.log(bob("orange", 12)); // 12 orange
// console.log("----------");
//
// console.log(bob("red", 55, "green")); // 55 redgreen
// console.log("----------");
//
// console.log(bob(testObject));
// console.log(bob());

// will this blow up?

const overloadedFilter = filter => withOverload(filter);

// console.log(new Signature(1, a => "a"));


const filterWithOverloads = filterBase => {
  const filter = withOverload(filterBase);

  filter.overloads
        .add({
          signature: new Signature(TYPES.NUMBER),
          method: a => [obj => obj.length >= 5],
          pipe: true
        })
  ;

  return filter;
};

const testArray = ["apple", "bear", "twentytwo", "a"];
const testArrayFilter = filterWithOverloads(testArray.filter);


testArray.filter = testArrayFilter;

console.log(testArray.filter(5));