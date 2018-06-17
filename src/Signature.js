import { getMapKeys } from "./manipulations";

const VOID = ( () => {
} )();

const TYPES_REGISTRY = new Map();

const checkTypes = parameter => {
  let keys = getMapKeys(TYPES_REGISTRY);
  return keys.map(key => TYPES_REGISTRY.get(key))
             .find(type => ( parameter instanceof type ));
};

export const TYPES = {
  STRING: ( typeof "apple" ),
  NUMBER: ( typeof 15 ),
  BOOLEAN: ( typeof true ),
  ARRAY: ( [].constructor.name ),
  VOID: '<VOID>',
  NULL: '<NULL>',
  CONSTRUCTOR: '<CONSTRUCTOR>',
  FUNCTION: 'FUNCTION',
  UNDEFINED: '<UNDEFINED>',
  ANY: '<ANY>',
  LAMBDA: '<LAMBDA>',

  REGISTRY: {
    HAS: stringName => {
      return TYPES_REGISTRY.has(Symbol.for(stringName));
    },
    LOAD: stringName => {
      const foundType = TYPES_REGISTRY.get(Symbol.for(stringName));
      try {
        new foundType.constructor();
        return foundType;
      } catch (err) {
        console.log(err);
      }
    },
    SEARCH: parameter => checkTypes(parameter),
    VIEW: () => TYPES_REGISTRY
  },

  register: (className, TypeClass) => TYPES_REGISTRY.set(Symbol.for(className), TypeClass),
};


class DefinedBy {
  constructor(someObject) {
    this.canonical =
      Object.keys(someObject)
            .reduce((keysCoveredSoFar, currentKey) => {
              return ( {
                ...keysCoveredSoFar,
                [currentKey]: getTypeNameOf(someObject[currentKey])
              } );
            }, {});

    TYPES.register(this.toString(), this);
  }

  toString() {
    return Object.keys(this.canonical)
                 .map(key => `${key}:${this.canonical[key]}`)
                 .join();
  }
}

export const NamedType = (name, instanceCheck, ...types) => {
  class GenericClass {
    static types = mapTypes(types);
    static check = instanceCheck(GenericClass.types);

    static isA(maybeInstance) {
      const type = mapTypes([maybeInstance])[0];
      return this.types.includes(type);
    }

    static [Symbol.hasInstance](maybeInstance) {
      const type = mapTypes([maybeInstance])[0];

      if (type === this.name) {return true;}

      return this.check(type); // slot: InstanceMethodCheck (obj) : bool
    };

    constructor(object) {
      if (( object instanceof GenericClass ) === false) {
        throw new Error("cannot be cast");
      }
      this.unboxed = object;

      return new Proxy(this, {
        get: function (thisArg, prop) {
          if (thisArg[prop]) {
            return thisArg[prop];
          } else {
            return thisArg.unboxed[prop];
          }
        }
      })
    }

    valueOf() {
      return this.unboxed;
    }
  }

  GenericClass.typeName = name;

  const klass = GenericClass;

  Object.defineProperty(klass, 'name', {
    writable: false, enumerable: false, configurable: true, value: name
  });

  TYPES.register(name, klass);

  return klass;
};


const unionInstanceCheck = array => oneType => array.includes(oneType);

export const UnionType = (name, ...types) => NamedType(name, unionInstanceCheck, ...types);

let intersectionInstanceCheck;
export const IntersectionType = (name, ...types) => NamedType(name, intersectionInstanceCheck, ...types);

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
      let newParam = new DefinedBy(param);
      return `{${newParam.toString()}}`;
    default:
      return constructorName;
  }
};

class Type {
  static [Symbol.hasInstance](maybeType) {
    const typeName = maybeType.constructor.name;

    if (!typeName) {
      throw new Error(`${maybeType} has no constructor name to check.`);
    }

    const doesExist = TYPES.REGISTRY.HAS(typeName);
    if (doesExist) {
      maybeType.class = typeName;
    }

    return doesExist;
  }
}


const getTypeNameOf = (param, onWayIn = false) => {
  if (param instanceof Type) {
    return Symbol.keyFor(Symbol.for(param.constructor.name));
  }

  if (onWayIn) {
    let maybeType = TYPES.REGISTRY.SEARCH(param);

    if (maybeType) {
      return maybeType;
    }
  }

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

export const mapTypesForBoxing = (parameters) => {
  return parameters.map(p => {
    return getTypeNameOf(p, true);
  });
};
export const mapTypes = (parameters) => parameters.map(p => getTypeNameOf(p));

const getSimpleSignature = (...parameters) => {
  return `${mapTypes(parameters).join()}`;
};

export function Signature(...parameters) {
  this.structure = mapTypes(parameters);

  this.needsBoxCheck = this.structure.find(aParam => {
    return ( aParam instanceof Type );
  });


  this.allowsAny = this.structure.includes(TYPES.ANY);

  this.length = parameters.length;

  this.toString = () => getSimpleSignature(...parameters);
  this.equals = (otherSignature) => {
    let result = false;
    if (otherSignature instanceof Signature) {
      if (otherSignature.length === this.length) {
        result = this.structure.every(
          (currentParameter, index) => currentParameter === otherSignature.structure[index]
        );
      }
    }
    return result;
  };
}

export function NoSuchSignatureError(signature, overloadedFunction) {
  this.name = 'NoSuchSignatureError';
  this.message = `No function matching signature <${signature}> found.
Did you mean:
    ${overloadedFunction.getSignatures().map(signature => signature.toString())}
`;
}

export function NoSignatureOfLengthError(signature, overloadedFunction) {
  this.name = 'NoSignatureOfLengthError';
  this.message = `No function with a signature <${signature}> of length ${signature.length} was found.
Did you mean:
    ${overloadedFunction.getSignaturesOfLength(signature.length).map(signature => `* ${signature.toString()}`)}`;
}