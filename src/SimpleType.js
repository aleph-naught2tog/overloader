import { TYPES } from "./Types";
import { mapTypes } from "./Signature";

function NotSimpleTypeError(type) {
  this.name = "NotSimpleTypeError";
  this.message = "That is not a simple type.";
}

const SimpleNamedType = (name, type) => {
  if (Object.keys(type).length !== 1) {
    throw new NotSimpleTypeError(type);
  }

  const key = Object.keys(type)[0];

  if (!key) {
    throw new Error("Something has gone horribly wrong.");
  }

  class GenericClass {
    static type = type;
    static mapped = mapTypes([type])[0];
    static key = key;
    static value = type[key];

    static [Symbol.hasInstance](maybeInstance) {
      const type = mapTypes([maybeInstance])[0];

      if (type === this.name || type === this.mapped) {
        return true;
      }

      if (Object.keys(maybeInstance).length === 0) {
        return false;
      }

      if (!maybeInstance.hasOwnProperty(GenericClass.key)) {
        return false
      }

      if (!( maybeInstance[GenericClass.key] instanceof GenericClass.value )) {
        return false;
      }

      return true;
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
  GenericClass.cast = object => {
    try {
      return new GenericClass(object);
    } catch (error) {
      throw new Error(`You may not cast a <${object}> to a(n) ${GenericClass.typeName}`);
    }
  };

  const klass = GenericClass;

  Object.defineProperty(klass, 'name', {
    writable: false, enumerable: false, configurable: true, value: name
  });

  Object.defineProperty(klass, 'category', {
    writable: false, enumerable: false, configurable: true, value: 'SimpleType'
  });

  TYPES.register(name, klass);

  return klass;
};

export const SimpleType = (name, type) => SimpleNamedType(name, type);