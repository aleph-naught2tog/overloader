import { Signature, TYPES, mapTypes } from "./Signature";
import { withOverload } from "./Overload";
//import { TEST_DATA } from './manipulations';

const identity = x => x;

const proxiedValueOf = obj => new Proxy(obj.valueOf, {
  apply: function (...args) {
    console.log('yo');
    console.log(args[0], args[1].unboxed);
  }
});

const UnionType = (name, ...types) => {
  class Unioner {
    static types = mapTypes(types);

    static isA(maybeInstance) {
      const type = mapTypes([maybeInstance])[0];
      return this.types.includes(type);
    }

    static [Symbol.hasInstance](maybeInstance) {
      const type = mapTypes([maybeInstance])[0];

      if (type === this.name) {
        return true;
      }

      return this.types.includes(type);
    };

    constructor(object) {
      if (( object instanceof Unioner ) === false) {
        throw new Error("cannot be cast");
      }
      // this.boxed = this;
      this.unboxed = object;
    }

    valueOf() {
      return this.unboxed;
    }
  }

  Unioner.operationType = Symbol.for("UNION");
  Unioner.typeName = name;

  const klass = Unioner;

  Object.defineProperty(klass, 'name', {
    writable: false, enumerable: false, configurable: true, value: name
  });

  TYPES.register(name, klass);

  return klass;
};

const IntersectionType = (name, ...types) => {
  class Intersecter {
    static [Symbol.hasInstance](maybeInstance) {
      const type = mapTypes([maybeInstance])[0];

      if (type === this.name) {
        return true;
      }

      return types.includes(type);
    };

    constructor(object) {
      if (( object instanceof Intersecter ) === false) {
        throw new Error("cannot be cast as intersection type");
      }

      this.unboxed = object;
    }
  }

  Intersecter.types = mapTypes(types);
  Intersecter.operationType = Symbol.for("INTERSECTION");
  Intersecter.typeName = name;

  const klass = Intersecter;

  Object.defineProperty(klass, 'name', {
    writable: false, enumerable: false, configurable: true, value: name
  });

  TYPES.register(name, klass);

  return klass;
};

const Class = {
    forName: name => {
      let result = TYPES.REGISTRY.LOAD(name);
      return result;
    }
  }
;

const Concattable = UnionType('Concattable', TYPES.STRING, TYPES.NUMBER);

const bloop = withOverload(x => x, true);

bloop.overloads.add({
  signature: new Signature(Concattable, Concattable),
  method: (a, b) => a + b
});

const newConcat1 = new Concattable("orange");
const newConcat2 = new Concattable(12);
console.log(bloop(newConcat1, newConcat2));

try {bloop(15);} catch (err) {console.log("caught")}

const hasColor = { color: "bdsadsa" };

const Colorable = UnionType('Colorable', hasColor);
//
// try {
//   const green = new Colorable("green");
// } catch (err) {
//   console.log("hopefully this threw!")
// }

const blue = new Colorable({ color: "blue" });
console.log(blue);
