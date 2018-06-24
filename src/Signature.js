import { getMapKeys } from "./manipulations";

const VOID = ( () => {
} )();
const TYPES_REGISTRY = new Map();

const checkTypes = parameter => {
  let keys = getMapKeys(TYPES_REGISTRY);
  return keys.map(key => TYPES_REGISTRY.get(key))
             .find(type => ( parameter instanceof type ));
};

const flatten = array => {
  if (!Array.isArray(array)) {
    return array;
  }

  return array.reduce((arraySoFar, object) => {
    let result;

    if (Object.keys(object).length > 1) {
      result = Object.keys(object).map(key => ( { [key]: object[key] } ));
    } else {
      result = ( { [Object.keys(object)[0]]: object[Object.keys(object)[0]] } );
    }

    return arraySoFar.concat(result);
  }, []);
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
    SEARCH: parameter => checkTypes(parameter)
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

export const NamedType = (name, instanceCheck, ...inputTypes) => {
  const types = inputTypes.map(type => Object.keys(type).length !== 0 ? flatten(type) : type);

  class GenericClass {
    static types = mapTypes(types);
    static rawTypes = types;
    static check = instanceCheck(GenericClass.types, GenericClass.rawTypes);

    static [Symbol.hasInstance](maybeInstance) {

      const type = mapTypes([maybeInstance])[0];

      if (type === this.name) {
        return true;
      }

      return this.check(type, maybeInstance); // slot: InstanceMethodCheck (obj) : bool
    };

    constructor(object) {

      if (( object instanceof GenericClass ) === false) {
        throw Error("cannot be cast");
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

    // noinspection JSUnusedGlobalSymbols
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


const unionInstanceCheck = (array, rawTypes) => (oneTypeAsString, typeAsObject) => {
  let flatType;

  if (( typeAsObject instanceof Object ) && !Array.isArray(typeAsObject)) {
    flatType = flatten([typeAsObject]);
  } else {
    flatType = typeAsObject;
  }

  if (Array.isArray(flatType)) {
    for (let type of flatType) {

      let foundType = rawTypes.find(MajorType => {
        try {
          return ( type instanceof MajorType );
        } catch (error) {
          return false;
        }
      });

      if (foundType) {
        return true;
      }
    }
  }

  return array.includes(oneTypeAsString);
};

const intersectionInstanceCheck = (array, rawTypes) => {
  console.log(array);
  console.log(rawTypes);
  return (oneTypeAsString, typeAsObject) => {
    let flatType;

    console.log(oneTypeAsString);
    console.log(typeAsObject);

    if (( typeAsObject instanceof Object ) && !Array.isArray(typeAsObject)) {
      flatType = flatten([typeAsObject]);
    } else {
      flatType = typeAsObject;
    }

    if (Array.isArray(flatType)) {
      return rawTypes.map(MajorType => {
        const foundMatch = flatType.find(minorType => ( minorType instanceof MajorType ));

        return foundMatch;
      }).every(result => result);
    }

    console.log("here");
    return array.includes(oneTypeAsString);
  };
};

export const IntersectionType = (name, ...types) => NamedType(name, intersectionInstanceCheck, ...types);

export const UnionType = (name, ...types) => NamedType(name, unionInstanceCheck, ...types);

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

  // noinspection JSUnusedGlobalSymbols
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

export function NoSuchSignatureError(signature) {
  this.name = 'NoSuchSignatureError';
  // noinspection JSUnusedGlobalSymbols
  this.message = `No function matching signature <${signature}> found.`;
}

export function NoSignatureOfLengthError(signature, overloadedFunction) {
  this.name = 'NoSignatureOfLengthError';
  // noinspection JSUnusedGlobalSymbols
  this.message = `No function with a signature <${signature}> of length ${signature.length} was found.
Did you mean:
    ${overloadedFunction.getSignaturesOfLength(signature.length).map(signature => `* ${signature.toString()}`)}`;
}