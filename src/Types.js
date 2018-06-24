import { getMapKeys } from "./manipulations";
import { DefinedBy } from "./DefinedBy";
import { Type } from "./Type";

const TYPES_REGISTRY = new Map();

const checkTypes = parameter => {
  let keys = getMapKeys(TYPES_REGISTRY);
  return keys.map(key => TYPES_REGISTRY.get(key))
             .find(type => ( parameter instanceof type ));
};

class CANONICAL_STRING {
  static [Symbol.hasInstance](maybeInstance) {
    return typeof maybeInstance === typeof "apple";
  }
}

class CANONICAL_NUMBER {
  static [Symbol.hasInstance](maybeInstance) {
    console.log(maybeInstance);
    return typeof maybeInstance === typeof 15;
  }
}

export const TYPES = {
  // STRING: ( typeof "apple" ),
  STRING: CANONICAL_STRING,
  NUMBER: CANONICAL_NUMBER,
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

const VOID = ( () => {
} )();

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

export const getTypeNameOf = (param, onWayIn = false) => {
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