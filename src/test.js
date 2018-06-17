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
        console.log('same name');
        return true;
      }

      return types.includes(type);
      // return false;
    };

    constructor(object) {
      console.log("###### unioner name:" + Unioner.name);
      // if (Unioner.isA(object) === false) {
      console.log("constructor");
      console.log(object);
      if ((object instanceof Unioner) === false) {
        throw new Error("cannot be cast");
      }
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
      console.log("==== START LOAD");
      let result = TYPES.REGISTRY.LOAD(name);
      console.log("==== END LOAD");

      return result;
    }
  }
;


const boop = UnionType('Concattable', TYPES.STRING, TYPES.NUMBER);

function Applier(target, thisArg, argumentList) {
  console.log("++++++ APPLY");
  console.log(target);
  console.log(thisArg);
  console.log(argumentList);
  console.log("++++++ END APPLY");

  return target(argumentList);
}

const concatHandler = {
  apply: Applier,
  construct: function(target, argumentList, thisArg) {
    console.log("____ CONSTRUCTOR ");
    console.log(target);
    console.log(thisArg);
    console.log(argumentList);
    console.log("____ END CONSTRUCTOR ");

    return new target(...argumentList);
  }
};

const Concattable = new Proxy(boop, concatHandler);

Class.forName('Concattable');

const bloop = withOverload(x => x, false);

bloop.overloads.add({
  signature: new Signature(Concattable, Concattable),
  method: (a, b) => a + b
});
const chalk = require('chalk');
console.log(chalk.yellow("~~~~ before new..."));
console.log(new Concattable("meow"));
// console.log(bloop(new Concattable("a"), new Concattable("b")));
console.log(chalk.yellow("~~~~ after new..."));

// let orange = new Orange("meow");
// console.log(orange.withApple("potato", "beef"));
//console.log(orange.withApple([1, 2, 3, 4, 5]));
