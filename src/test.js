import { Signature, TYPES, UnionType } from "./Signature";
import { withOverload } from "./Overload";


const assertTrue = value => {
  if (value) {
    return true;
  } else {
    throw new Error("assertion failed");
  }
};

const assertFalse = value => assert(!value);

const assert = something => ( {
  equals: value => assertTrue(something === value),
  willThrowOn: (...args) => {
    let didThrow = false;

    try {
      something(...args);
    } catch (error) {
      didThrow = true;
    }

    assertTrue(didThrow);
  },
} );

assertTrue(true);
assertFalse(false);
assert(assertTrue).willThrowOn(false);
const Concattable = UnionType('Concattable', TYPES.STRING, TYPES.NUMBER);

const bloop = withOverload(x => x, true);

bloop.overloads.add({
  signature: new Signature(Concattable, Concattable),
  method: (a, b) => a + b
});

const newConcat1 = new Concattable("orange");
const newConcat2 = new Concattable(12);
console.log(bloop(newConcat1, newConcat2));

let bob = withOverload(x => x);
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
     signature: new Signature(),
     method: () => "orange"
   })
;


console.log(bob(10, "apple"));        // 10 apple
console.log("----------");

console.log(bob("orange", 12));       // 12 orange
console.log("----------");

console.log(bob("red", 55, "green")); // 55 redgreen
console.log("----------");

const hasColor = { color: "bdsadsa" };
const Colorable = UnionType('Colorable', hasColor);
const Readable = UnionType('Readable', { read: TYPES.LAMBDA });
console.log(Readable);

const IsReadableOrColorable = UnionType('IsReadableOrColorable', Colorable, Readable);
console.log(IsReadableOrColorable);

try {
  new Colorable("green");
} catch (err) {
  console.log("green only hopefully this threw!")
}

try {
  new Colorable({ color: 12 });
} catch (err) {
  console.log("color 12 hopefully this threw!")
}

const blue = new Colorable({ color: "blue" });
console.log(blue);
console.log(blue.color);
