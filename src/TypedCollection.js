import { TYPES } from './Types';

export const TypedCollection = (name, SomeType) => {
  class TypedCollection {
    static allowedType = SomeType;

    constructor() {
      this.items = [];
    }

    add(item) {
      if (item instanceof TypedCollection.allowedType) {
        this.items.push(item);
      } else {
        throw new Error("Wrong type");
      }
    }

    size() {
      return this.items.length;
    }

    forEach(action) {
      return this.items.forEach(action);
    }

    valueOf() {
      return this.items;
    }
  }

  const klass = TypedCollection;

  Object.defineProperty(klass, 'name', {
    writable: false, enumerable: false, configurable: true, value: name
  });

  TYPES.register(name, klass);

  return klass;
};

export const NumericArray = TypedCollection('NumericArray', TYPES.NUMBER);
export const StringArray = TypedCollection('StringArray', TYPES.STRING);