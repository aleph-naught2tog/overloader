import { flatten } from "./manipulations";
import { mapTypes} from "./Signature";
import { TYPES } from "./Types";

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
      this.type = name;

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

  TYPES.register(name, klass);

  return klass;
};