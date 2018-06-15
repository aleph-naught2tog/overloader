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

class WrongTypeError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
    this.name = 'WrongTypeError';
  }
}

function TypedArray(type) {
  const array = [];
  array.type = type;
  
  array.addValue = value => {
    if (typeof value === type) {
      return true;
    } else {
      return false;
    }
  };
  
  return new Proxy(array, ( {
      set: (target, property, value, receiver) => {
        let shouldProceed = false;
        
        switch (property) {
          case "length":
            shouldProceed = true;
            break;
          default: // should be the number of location
            shouldProceed = target.addValue(value);
            break;
        }
        
        if (shouldProceed) {
          target[property] = value;
          return true;
        } else {
          throw new WrongTypeError(`<${value}> is not of ${array.type}`);
        }
      }
    } )
  );
}

function StringArray() {
  let result = TypedArray.call(this, "string");
  
  return result;
}

function NumberArray() {
  return new TypedArray("number");
}

function BooleanArray() {
  return new TypedArray("boolean");
}

const aggregate = withOverload(x => x, false);
aggregate.overloads
         .add({
           signature: new Signature(new StringArray()),
           method: (array) => [array, (a, b) => `${a}${b}`],
           pipe: true
         })
         // .add({ signature: new Signature(new NumberArray()) })
         .add({ signature: new Signature(new BooleanArray()), method: (array) => [array, (a, b) => "xX"], pipe: true })
         .add({ signature: new Signature(new NumberArray()), method: (array) => [array, (a, b) => a + b], pipe: true })
         .add({ signature: new Signature(TYPES.ANY, TYPES.LAMBDA), method: (array, reducer) => array.reduce(reducer) })
;

let strings = new StringArray();
strings.push("apple");
strings.push("banana");
console.log(strings);
console.log(typeof strings);
console.log(strings.constructor.name);

let numbers = new NumberArray();
numbers.push(1);
numbers.push(22);
numbers.push(900);

let booleans = new BooleanArray();
booleans.push(true);
booleans.push(true);
booleans.push(true);
booleans.push(false);
booleans.push(false);

console.log(strings);

console.log(aggregate(strings));
console.log(aggregate(numbers));
console.log(aggregate(booleans));
