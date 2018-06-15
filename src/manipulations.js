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
    length: range(10, 15, 0.5),
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

const TEST_DATA = generateRandomStudents(25);

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

function Counter() {
  this.count = 0;

  this.increment = () => {
    this.count = this.count + 1
  };

  this.decrement = () => {
    this.count = this.count - 1
  };
}

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

console.log(TEST_DATA.sort(sortByKey('house')).map(o => o['house']));
const reducer = (howToReduce) => {
  const result = ( {
    withInitialObject: array => array.reduce(howToReduce, {}),
    withInitialArray: array => array.reduce(howToReduce, [])
  } );

  return result;
};

const reduce = (what) => {
  const result = ( {
    by: {
      counting: how => reducer(how),
      summing: how => reducer(how)
    }
  } );

  return result;
};

const columnGetFunction = key => data => data[key];

const row = schema => data => ( {
  get: key => data[key]
} );


const resultSet = results => {
  const resultObject = {

    groupBy: null // bloop,
  };

  return resultObject;
};

const chainable = (clause) => {
    clause.and = () => {};
    clause.or = () => {};
};

const subTable = table => {
  table.where = keyOrCondition => {
    let where;

    if (typeof keyOrCondition === "string") {
      const key = keyOrCondition; // rename for clarity
      where = ( {
        equals: value => subTable(table).where(row => row[key] === value)
      } );
    } else {
      where = subTable(table.filter(keyOrCondition));
    }

    return where;
  };

  return table;
};

const select = (...columns) => {
  const selectFunction = {};

  const withColumns = table => table;

  const columnMapper = row => {
    let rowObject = {};

    columns.forEach(column => rowObject[column] = row[column]);

    return rowObject;
  };

  selectFunction.from = table => withColumns(subTable(table.map(columnMapper)));

  // () => resultSet(table.map(columnMapper));

  return selectFunction;
};

console.log(select("age", "house").from(TEST_DATA).where('pet').equals('cat'));

// SELECT: (...columns) => function that maps each row to those column values

const table = (arrayOfObjects) => {
  const self = {};
  const tokenObject = arrayOfObjects[0];

  self.rows = arrayOfObjects;
};
