import { getMapKeys, flattenDeep } from "./manipulations";

const VOID = ( () => {
} )();

const TYPES_REGISTRY = new Map();

const checkTypes = parameter => {
  let keys = getMapKeys(TYPES_REGISTRY);

  console.log(keys.map(key => TYPES_REGISTRY.get(key))
                  .find(type => {
                    console.log(type);
                    console.log(parameter);
                    console.log(parameter instanceof type);
                    return ( parameter instanceof type );
                  }));

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
    HAS: stringName => TYPES_REGISTRY.has(Symbol.for(stringName)),
    LOAD: stringName => TYPES_REGISTRY.get(Symbol.for(stringName)),
    SEARCH: parameter => checkTypes(parameter),
  },

  register: (className, TypeClass) => TYPES_REGISTRY.set(Symbol.for(className), TypeClass)
};

const reduceObjectToSignature = someObject =>
  Object.keys(someObject)
        .map(key => `${key}:${getTypeNameOf(someObject[key])}`)
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

class Type {
  static [Symbol.hasInstance](maybeType) {
    return TYPES.REGISTRY.HAS(maybeType);
  }
}


const getTypeNameOf = (param, onWayIn = false) => {

  if (param instanceof Type) {
    return Symbol.for(param);
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

  this.needsBoxCheck = this.structure.find(aParam => ( aParam instanceof Type ));

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