import { Signature, TYPES } from "./Signature";
import { withOverload } from "./Overload";

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


console.log(bob(10, "apple")); // 10 apple
console.log("----------");

console.log(bob("orange", 12)); // 12 orange
console.log("----------");

console.log(bob("red", 55, "green")); // 55 redgreen
console.log("----------");

console.log(bob([1, 2, 3]));
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
          method: number => [((obj) => {
            return obj.length >= number
          })]
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
