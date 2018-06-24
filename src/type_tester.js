const CanonicalType = function (object) {
  this.canon = object;
  console.log(typeof this.canon);
  this.allows = testObject => ( typeof testObject ) === ( typeof this.canon );
};

const CANONICAL_STRING = new CanonicalType("apple");
const CANONICAL_NUMBER = new CanonicalType(23);
const CANONICAL_BOOLEAN = new CanonicalType(true);

const ALL_TYPES = new Map();
ALL_TYPES.set(Symbol.for('string'), CANONICAL_STRING);
ALL_TYPES.set(Symbol.for('number'), CANONICAL_NUMBER);
ALL_TYPES.set(Symbol.for('boolean'), CANONICAL_BOOLEAN);

const TYPES = {
  get: typeName => ALL_TYPES.get(Symbol.for(typeName))
};

const typedef = (key, type, isRequired = false) => ( {
  key: key,
  type: TYPES.get(type),
  isRequired: isRequired,
  test: object => object.hasOwnProperty(key) && ( TYPES.get(type).allows(object[key]) )
} );

const required = (key, type) => typedef(key, type, true);
const optional = (key, type) => typedef(key, type, false);

const requiredReadable = required('readable', 'boolean');
const requiredWritable = required('writable', 'boolean');
const optionalReadable = optional('readable', 'boolean');
const optionalWritable = optional('writable', 'boolean');
console.log(requiredReadable);
console.log(requiredWritable);
console.log(optionalReadable);
console.log(optionalWritable);

class Type {
  static parseObject(object) {
    return Object.keys(object).map(key => ( { [key]: object[key] } ));
  }

  constructor(...typedefs) {
    this.defs = typedefs;
  }

  getRequired = () => {
    return this.defs.filter(def => def.isRequired)
  };

  getOptional = () => {
    return this.defs.filter(def => def.isRequired === false)
  }

  passes = (object) => {
    const hasRequiredFields = this.getRequired().length !== 0;
    const hasOptionalFields = this.getOptional().length !== 0;
    let allRequiredFieldsPresent;
    let atLeastOneOptionalFieldPresent;

    if (hasRequiredFields) {
      allRequiredFieldsPresent = this.getRequired().every(type => type.test(object));
    }

    if (hasOptionalFields) {
      atLeastOneOptionalFieldPresent = this.getOptional().find(type => type.test(object));
    }
    // no optional fields, but all rquired fields, still passes
    return allPassed;
  }
}

const reqReadableOptWritable = new Type(requiredReadable, optionalWritable);
const reqReadableReqWritable = new Type(requiredReadable, requiredWritable);
const optReadableOptWritable = new Type(optionalReadable, optionalWritable);
const optReadableReqWritable = new Type(optionalReadable, requiredWritable);

const typesToCheck = {
  reqReadableOptWritable: reqReadableOptWritable,
  reqReadableReqWritable: reqReadableReqWritable,
  optReadableOptWritable: optReadableOptWritable,
  optReadableReqWritable: optReadableReqWritable
};

let objectsToTest = [
  { readable: true, writable: true },
  { writable: false },
  { readable: false },
  { readable: false, writable: false },
  { readable: 15 },
  { readable: 15, writable: false },
  { writable: 20 },
  15, "string", "omega", { orange: "banana", writable: true }, { writable: false, readable: true, applesauce: 15 }
];

console.log(require('util').inspect(objectsToTest.map(object => ( {
  object: object,
  result: Object.keys(typesToCheck)
                .reduce((resultSoFar, key) => ( { ...resultSoFar, [key]: typesToCheck[key].passes(object) } ), {})
} ))));