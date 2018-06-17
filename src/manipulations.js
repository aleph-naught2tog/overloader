const log = require('util').inspect;

export const requireNumbers = (...valuesToTest) => {
  valuesToTest.forEach(value => {
    if (isNaN(value)) {
      throw new Error('must be a number');
    }
  });
};

export const requireIterable = (...valuesToTest) => {
  valuesToTest.forEach(value => {
    if (value instanceof Array
      || value instanceof Set) {
      return;
    } else {
      throw new Error('must be iterable');
    }
  });
};


// .map(whetherTypesMatch(signature))
// .reduce((isTrueSoFar, maybeTrue) => isTrueSoFar && maybeTrue, true);


// noinspection JSUnusedLocalSymbols
const isIterable = value => ( value instanceof Array
  || value instanceof Set );

export const isNumber = value => !isNaN(value);

// noinspection JSUnusedLocalSymbols
const isNotANumber = value => !isNumber(value);
export const isString = value => typeof value === 'string';

// noinspection JSUnusedLocalSymbols
const isNotString = value => !isString(value);
export const isArray = value => Array.isArray(value);

// noinspection JSUnusedLocalSymbols
const isNotArray = value => !isArray(value);
export const isSet = value => value instanceof Set;

// noinspection JSUnusedLocalSymbols
const isNotSet = value => !isSet(value);
export const isNotEmpty = value => isArray(value) && value.length !== 0;

// noinspection EqualityComparisonWithCoercionJS, JSUnusedLocalSymbols
const isFalsy = value => value == false; // intentional ==


// noinspection EqualityComparisonWithCoercionJS // noinspection JSUnusedLocalSymbols
const isTruthy = value => value == true; // intentional ==

export const range = (minimum, maximum, step = 1, shouldIncludeEndPoints = true) => {
  requireNumbers(minimum, maximum);

  let trueMinimum = shouldIncludeEndPoints ? minimum : minimum + 1;
  let trueMaximum = shouldIncludeEndPoints ? maximum + 1 : maximum;
  const endLength = ( trueMaximum - trueMinimum ) / step;

  return Array(endLength).fill(trueMinimum).map((trueMinimum, index) => trueMinimum + index);
};

export const randomIndex = array => {
  requireIterable(array);

  return Math.round(Math.random() * ( array.length - 1 ));
};
export function flattenDeep(arr1) {
  return arr1.reduce((acc, val) => Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val), []);
}

// noinspection JSUnusedLocalSymbols
export const shuffle = array => {
  let shuffledArray = [];

  while (isNotEmpty(array)) {
    shuffledArray = shuffledArray.concat(array.splice(randomIndex(array)), 1);
  }

  return shuffledArray;
};

const STUDENT_VALUES = {
  age: range(10, 18),
  house: ['gryffindor', 'hufflepuff', 'ravenclaw', 'slytherin'],
  pet: ['cat', 'rat', 'dog', 'toad', 'owl', 'ferret', 'hippogriff'],
  wand: {
    wood: ['holly', 'oak', 'yew', 'willow'],
    length: range(10, 15, 1),
    core: ['unicorn hair', 'phoenix feather', 'veela hair', 'kneazle whisper', 'dragon heartstring']
  }
};

export const randomItem = array => array[randomIndex(array)];
export const randomItemByKey = (object, key) => randomItem(object[key]);

export const hasKey = (object, key) => Object.keys(object).includes(key);
export const doesNotHaveKey = (object, key) => !hasKey(object, key);

const generateRandomStudent = () => ( {
  age: randomItemByKey(STUDENT_VALUES, 'age'),
  house: randomItemByKey(STUDENT_VALUES, 'house'),
  pet: randomItemByKey(STUDENT_VALUES, 'pet'),
  wand: {
    wood: randomItemByKey(STUDENT_VALUES.wand, 'wood'),
    length: randomItemByKey(STUDENT_VALUES.wand, 'length'),
    core: randomItemByKey(STUDENT_VALUES.wand, 'core')
  }
} );

const generateRandomStudents = number => Array(number).fill(0).map(generateRandomStudent);

export const TEST_DATA = generateRandomStudents(25);

// noinspection JSUnusedLocalSymbols
const regexKeyFilter = (map, regex) => filterMap(map, key => regex.test(key));


// noinspection JSUnusedLocalSymbols
const mapKeyArrayHasFilter = (map, object) => filterMap(map, key => key.includes(object));

export const getMapKeys = map => {
  const mapKeys = [];
  map.forEach((index, key) => mapKeys.push(key));
  return mapKeys;
};


// noinspection JSUnusedLocalSymbols
const mapMap = (map, callback) => {
  const mappedMap = new Map();

  getMapKeys(map).forEach(key => mappedMap.set(key, callback(key, map.get(key))));

  return mappedMap;
};

export const filterMap = (map, callback) => {
  const filteredMap = new Map();

  getMapKeys(map).forEach(key => {
    const isTrue = callback(key, map.get(key));

    if (isTrue) {
      filteredMap.set(key, map.get(key));
    }

  });

  return filteredMap;
};

export const mapToString = array => array.map(item => item.toString());

const compareCodePoints = (objectOne, objectTwo) => {
  const stringArrayOne = objectOne.toString().split("").map(char => char.codePointAt(0));
  const stringArrayTwo = objectTwo.toString().split("").map(char => char.codePointAt(0));

  while (isNotEmpty(stringArrayOne)) {
    let charOne = stringArrayOne.shift();
    let charTwo = stringArrayTwo.shift();

    if (charOne === charTwo) {
      continue;
    } else {
      return charOne - charTwo;
    }
  }
};

const sortByKey = (key, type = "string") => {
  switch (type) {
    case "string":
      return (a, b) => compareCodePoints(a[key], b[key]);
    case "number":
      return (a, b) => a[key] - b[key];
    default:
      return (a, b) => compareCodePoints(a[key], b[key]);
      break;
  }
};

const uniqueArray = array => Array.from(new Set(array));

let array = TEST_DATA;

/*
  SELECT:
    I: takes an array of keys + what to do with them
    O: a function that
      _i: array of rows
      _o: transformed array of rows

  FROM:
    I: some table
      [ with:
          WHERE:
            I: condition
            O: the rows of the table such that condition => true
          JOIN:
            _sub: join TYPE
            I: another table
      ]
    O: the actual result set


FROM : table
  WHERE before group by : predicate on rows
  GROUP BY : columns
    HAVING after group by : predicate on groups
  ORDER BY : columns
*/

let counter = 0;

const OR = Symbol("or");
const AND = Symbol("and");




class Table {

  constructor(array) {
    this.root = array;

    this.whereConditions = [];
    this.groupByColumns = [];
  }

  where = (rowPredicate, operator) => {
    this.table = array.filter(rowPredicate);

    return {
      or: { where: conditional => this.where(conditional, OR) },
      and: { where: conditional => this.where(conditional, OR) }
    };
  }
}

Table.beepBloop = () => "apple";

var bob = new Table([]);
console.log(require('util').inspect(bob));

const table = [
  {row: ++counter, first: "bob", last: "bobberson", age: 25},
  {row: ++counter, first: "tom", last: "tommerson", age: 12},
  {row: ++counter, first: "diane", last: "dianerson", age: 28}
];

const identity = x => x;
const selectKey = key => row => row[key];

const columnConcat = (...keys) => row => keys.map(key => selectKey(key)(row)).join(" ");
const defaultColumnName = (action, keys) => `${action.name} ( ${keys.join()} )`;

const multiSelectAction = (keys, action = columnConcat, as = defaultColumnName(action, keys)) => row => ({ [as]: action(...keys)(row) });

const selectAction = (key, action = identity) => row => ({ [key]: action(selectKey(key)(row)) });
// var selectAction = (key, action = identity) => row => ({ key: key, result: action(selectKey(key)(row)) });

const doSelectOnFrom =
  (selectActions, inputTable) => inputTable.map(
    row =>
      selectActions.reduce(
        (returnRowThusFar, singleSelectAction) => {

          return ({ ...returnRowThusFar, ...singleSelectAction(row)});
        }, {}
        // [singleSelectAction(row).key]: singleSelectAction(row).result })
      )
  );

const select = (...actions) => ({ from: array => doSelectOnFrom(actions, array) });

const simpleSelect =
  select( selectAction('row'), selectAction('age') )
    .from(table);

const multiSelect =
  select( selectAction('row'), multiSelectAction(['first', 'last']), selectAction('age') )
    .from(table);

var logger = require('util').inspect;

console.log(logger(multiSelect));