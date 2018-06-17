import { Signature, TYPES, mapTypes } from "./Signature";
import { withOverload } from "./Overload";
//import { TEST_DATA } from './manipulations';

const identity = x => x;

const UnionType = (name, ...types) => {
  class Unioner {
    static isA(maybeInstance) {
      const type = mapTypes([maybeInstance])[0];
      return types.includes(type);
    }

    static [Symbol.hasInstance](maybeInstance) {
      const type = mapTypes([maybeInstance])[0];

      if (type === this.name) {
        return true;
      }

      return types.includes(type);
    };

    constructor(object) {
      if ((object instanceof Unioner) === false) {
        throw new Error("cannot be cast");
      }
      console.log(this);
      // this.boxed = this;
      this.unboxed = object;
      return new Proxy(this, {
        apply: console.log,
        call: console.log,
        get: function(target, prop, receiver) {
          console.log('get');
          console.log('  ', prop);
          console.log('------', target[prop]);
          // console.log(receiver);

          return Reflect.get(...arguments);
        }
      });
    }

    valueOf() {
      return this.unboxed;
    }
  }

  Unioner.types = mapTypes(types);
  Unioner.operationType = Symbol.for("UNION");
  Unioner.typeName = name;

  const klass = Unioner;

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

const chalk = require('chalk');

const tester = new Concattable("apple");
console.log(tester);
console.log(tester.unboxed);

console.log(bloop(new Concattable("a"), new Concattable("b")));
console.log(bloop("a", "b"));
