import { Signature, TYPES, mapTypes } from "./Signature";
import { withOverload } from "./Overload";
import { TEST_DATA } from './manipulations';

const identity = x => x;
const bob = withOverload(identity);

function Test() {
}

const testObject = new Test();

bob.overloads
   .add({
     signature: new Signature("a", 1),
     method: (a, b) => [b, a],
     pipe: true
   })
   .add({
     signature: new Signature(1, "a"),
     method: (a, b) => `${a} ${b}`
   })
   .add({
     signature: new Signature("a", 1, "c"),
     method: (a, b, c) => [`${a}${c}`, b],
     pipe: true
   })
   .add({
     signature: new Signature(testObject),
     method: a => [1, 'hello'],
     pipe: true
   })
   .add({
     signature: new Signature(),
     method: () => "orange"
   })
   .add({
     signature: new Signature(TYPES.ANY),
     method: (bob) => "apple"
   })
;


console.log(bob(10, "apple"));        // 10 apple
console.log("----------");

console.log(bob("orange", 12));       // 12 orange
console.log("----------");

console.log(bob("red", 55, "green")); // 55 redgreen
console.log("----------");

console.log(bob([1, 2, 3]));          // "apple"
console.log("----------");

console.log(bob(new Test()));         // 1 hello
console.log("----------");

// should fail
console.log(bob(null, null));
console.log("----------");


const lengthFilterWithOverloads = filterBase => {
  const filter = withOverload(filterBase.method, false);

  filter.overloads
        .add({
          signature: new Signature(TYPES.ARRAY),
          method: array => array.filter(obj => obj.length >= 5),
        })
        .add({
          signature: new Signature(TYPES.NUMBER),
          method: number => [( (obj) => {
            return obj.length >= number
          } )]
          , pipe: true
        })
        .add({
          signature: new Signature(TYPES.LAMBDA),
          method: filterFunction => filterFunction
        })
  ;

  return filter;
};

const testArray = ["apple", "bear", "twentytwo", "a"];

const filter = lengthFilterWithOverloads(identity);

const omgItWorked = testArray.filter(filter(5));

console.log(omgItWorked);

const withApple = withOverload(x => x);
withApple.overloads
         .add({
           signature: new Signature(TYPES.ANY),
           method: lengthThing => `${lengthThing} has length ${lengthThing.length}`
         })
         .add({
           signature: new Signature(TYPES.STRING, TYPES.STRING),
           method: (stringOne, stringTwo) => [( stringOne + stringTwo ).toUpperCase()],
           pipe: true
         })
         .add({
           signature: new Signature(TYPES.ARRAY),
           method: array => [array.reverse()],
           pipe: true
         });

class Orange {
  constructor(name) {
    this.name = name;

    console.log("hello");
  }

  withApple = withApple;
}

const UnionType = (name, ...types) => {
  class Unioner {
    static isA(maybeInstance) {
      console.log(maybeInstance);
      console.log(mapTypes([maybeInstance])[0]);
      const type = mapTypes([maybeInstance])[0];
      return types.includes(type);
    }

    constructor(object) {
      console.log("hello");
      console.log(this);
      console.log(object);
      if (Unioner.isA(object) === false) {
        throw new Error("cannot be cast");
      }
    }
  }

  Unioner.types = mapTypes(types);
  // Unioner.box = (object) => {
  //   return new Unioner(object);
  // };


  // console.log(Unioner.box(15));
  // console.log(Unioner);
  // console.log(new Unioner(15));
  // return Unioner;
  // };

  const klass = Unioner;

  Object.defineProperty(klass, 'name', {
    writable: false, enumerable: false, configurable: true, value: name
  });

  TYPES.register(name, klass);

  return klass;
};

const wrap = (object, klass) => {
  object.unboxed = object;
  object.boxed = klass;
};


const Concattable = UnionType('Concattable', TYPES.STRING, TYPES.NUMBER);
console.log(Concattable);
const apple = new Concattable();
console.log(apple instanceof Concattable);

const bloop = withOverload(x => x, false);

bloop.overloads.add({
  signature: new Signature(Concattable, Concattable),
  method: (a, b) => a + b
});

// console.log(bloop.overloads.all);

console.log(bloop(new Concattable("a"), new Concattable("b")));

// let orange = new Orange("meow");
// console.log(orange.withApple("potato", "beef"));
//console.log(orange.withApple([1, 2, 3, 4, 5]));
