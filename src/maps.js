import { mapTypes } from './Signature';
import { hasKey, doesNotHaveKey } from './manipulations';

const STRING = "1string";
const NUMBER = "1number";
const ARRAY = "1array";

const STRING_STRING = [STRING, STRING];
const STRING_NUMBER = [STRING, NUMBER];
const STRING_ARRAY = [STRING, ARRAY];
const STRING_ARRAY_SUB_STRING = [STRING, [STRING]];

const SET_OF_KEYS = [
  STRING_STRING, STRING_NUMBER, STRING_ARRAY, STRING_ARRAY_SUB_STRING
];

const TYPE_DICT = {
  [typeof "apple"]: STRING,
  [typeof 15]: NUMBER,
  [[].constructor.name]: ARRAY
};

const map = new Map();

map.set(["string", "string"], "hardcoded string string array");
map.set([STRING, STRING], "array with string constants");
map.set(STRING_STRING, "STRING_STRING constant");

const accessViaAnotherHardcoded = map.get(["string", "string"]);
const accessViaArrayWithStringConstants = map.get([STRING, STRING]);
const accessViaConstant = map.get(STRING_STRING);

console.log('hardcoded', accessViaAnotherHardcoded);
console.log('string, strign', accessViaArrayWithStringConstants);
console.log('constant', accessViaConstant);

const getConstant = (...arrayOfArguments) => {
  console.log(mapTypes(arrayOfArguments).map(item => TYPE_DICT[item]));
};

getConstant("orange", 343, ["dsa"]);

const testArrays = [
  ["apple", "apple", "bear"],
  ["apple", "bear", "apple"],
  ["bear", "apple"],
  ["apple", "bear", "bear"]
];

const reducedByLength = testArrays.reduce((arraysByLength, currentArray) => {

  const currentLength = currentArray.length;

  if (doesNotHaveKey(arraysByLength, currentLength.toString())) {
    arraysByLength[currentLength] = [];
  }

  arraysByLength[currentLength].push(currentArray);

  return arraysByLength;

}, {});

const reduceByTerm =
  array => array.reduce((arraysByCommonTerms, currentArray) => {

    const index = 0;
    const term = currentArray[index];

    if (doesNotHaveKey(arraysByCommonTerms, term)) {
      arraysByCommonTerms[term] = [];
    }

    arraysByCommonTerms[term].push(currentArray);

    return arraysByCommonTerms;
  }, {});

const reducedByFirstTerm =
  Object.keys(reducedByLength)
        .map(key => reduceByTerm(reducedByLength[key]));

reducedByFirstTerm.forEach(console.log);