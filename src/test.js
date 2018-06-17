import { Signature, TYPES, mapTypes, UnionType, IntersectionType } from "./Signature";
import { withOverload } from "./Overload";
//import { TEST_DATA } from './manipulations';


const assertTrue = value => {
  if (value) {
    return true;
  } else {
    throw new Error("assertion failed");
  }
};

const assertFalse = value => assert(!value);

const assert = something => ({
  equals: value => assertTrue(something === value),
  doesNotEqual: value => assertTrue(something !== value),
  willThrowOn: (...args) => {
    let didThrow = false;

    try {
      something(...args);
    } catch (error) {
      didThrow = true;
    }

    assertTrue(didThrow);
  },
  willNotThrowOn: (...args) => {
    let didThrow = false;

    try {
      something(...args);
    } catch (error) {
      didThrow = true;
    }

    assertFalse(didThrow);
  }
});

assertTrue(true);
assertFalse(false);
assert(assertTrue).willThrowOn(false);
// assert(assertTrue).willThrowOn(true);

const identity = x => x;

const proxiedValueOf = obj => new Proxy(obj.valueOf, {
  apply: function (...args) {
    console.log('yo');
    console.log(args[0], args[1].unboxed);
  }
});

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

try {
  bloop(15);
} catch (err) {
  console.log("caught")
}

const hasColor = { color: "bdsadsa" };
const Colorable = UnionType('Colorable', hasColor);
const Readable = UnionType('Readable', { read: TYPES.LAMBDA });
console.log(Readable);

const IsReadableOrColorable = UnionType('IsReadableOrColorable', Colorable, Readable);
console.log(IsReadableOrColorable);
const beep = {};
// console.log('beep.read: ' + beep.read);

try {
  const green = new Colorable("green");
} catch (err) {
  // console.log("hopefully this threw!")
}

try {
  const green = new Colorable({ color: 12 });
} catch (err) {
  // console.log("hopefully this threw!")
}

const blue = new Colorable({ color: "blue" });
console.log(blue);
console.log(blue.color);
