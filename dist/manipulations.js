'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var requireNumbers = exports.requireNumbers = function requireNumbers() {
  for (var _len = arguments.length, valuesToTest = Array(_len), _key = 0; _key < _len; _key++) {
    valuesToTest[_key] = arguments[_key];
  }

  valuesToTest.forEach(function (value) {
    if (isNaN(value)) {
      throw new Error('must be a number');
    }
  });
};

var requireIterable = exports.requireIterable = function requireIterable() {
  for (var _len2 = arguments.length, valuesToTest = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    valuesToTest[_key2] = arguments[_key2];
  }

  valuesToTest.forEach(function (value) {
    if (value instanceof Array || value instanceof Set) {
      return;
    } else {
      throw new Error('must be iterable');
    }
  });
};

// .map(whetherTypesMatch(signature))
// .reduce((isTrueSoFar, maybeTrue) => isTrueSoFar && maybeTrue, true);


// noinspection JSUnusedLocalSymbols
var isIterable = function isIterable(value) {
  return value instanceof Array || value instanceof Set;
};

var isNumber = exports.isNumber = function isNumber(value) {
  return !isNaN(value);
};

// noinspection JSUnusedLocalSymbols
var isNotANumber = function isNotANumber(value) {
  return !isNumber(value);
};
var isString = exports.isString = function isString(value) {
  return typeof value === 'string';
};

// noinspection JSUnusedLocalSymbols
var isNotString = function isNotString(value) {
  return !isString(value);
};
var isArray = exports.isArray = function isArray(value) {
  return Array.isArray(value);
};

// noinspection JSUnusedLocalSymbols
var isNotArray = function isNotArray(value) {
  return !isArray(value);
};
var isSet = exports.isSet = function isSet(value) {
  return value instanceof Set;
};

// noinspection JSUnusedLocalSymbols
var isNotSet = function isNotSet(value) {
  return !isSet(value);
};
var isNotEmpty = exports.isNotEmpty = function isNotEmpty(value) {
  return isArray(value) && value.length !== 0;
};

// noinspection EqualityComparisonWithCoercionJS, JSUnusedLocalSymbols
var isFalsy = function isFalsy(value) {
  return value == false;
}; // intentional ==


// noinspection EqualityComparisonWithCoercionJS // noinspection JSUnusedLocalSymbols
var isTruthy = function isTruthy(value) {
  return value == true;
}; // intentional ==

var range = exports.range = function range(minimum, maximum) {
  var step = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  var shouldIncludeEndPoints = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

  requireNumbers(minimum, maximum);

  var trueMinimum = shouldIncludeEndPoints ? minimum : minimum + 1;
  var trueMaximum = shouldIncludeEndPoints ? maximum + 1 : maximum;
  var endLength = (trueMaximum - trueMinimum) / step;

  return Array(endLength).fill(trueMinimum).map(function (trueMinimum, index) {
    return trueMinimum + index;
  });
};

var randomIndex = exports.randomIndex = function randomIndex(array) {
  requireIterable(array);

  return Math.round(Math.random() * (array.length - 1));
};

// noinspection JSUnusedLocalSymbols
var shuffle = exports.shuffle = function shuffle(array) {
  var shuffledArray = [];

  while (isNotEmpty(array)) {
    shuffledArray = shuffledArray.concat(array.splice(randomIndex(array)), 1);
  }

  return shuffledArray;
};

var STUDENT_VALUES = {
  age: range(10, 18),
  house: ['gryffindor', 'hufflepuff', 'ravenclaw', 'slytherin'],
  pet: ['cat', 'rat', 'dog', 'toad', 'owl', 'ferret', 'hippogriff'],
  wand: {
    wood: ['holly', 'oak', 'yew', 'willow'],
    length: range(10, 15, 1),
    core: ['unicorn hair', 'phoenix feather', 'veela hair', 'kneazle whisper', 'dragon heartstring']
  }
};

var randomItem = exports.randomItem = function randomItem(array) {
  return array[randomIndex(array)];
};
var randomItemByKey = exports.randomItemByKey = function randomItemByKey(object, key) {
  return randomItem(object[key]);
};

var hasKey = exports.hasKey = function hasKey(object, key) {
  return Object.keys(object).includes(key);
};
var doesNotHaveKey = exports.doesNotHaveKey = function doesNotHaveKey(object, key) {
  return !hasKey(object, key);
};

var generateRandomStudent = function generateRandomStudent() {
  return {
    age: randomItemByKey(STUDENT_VALUES, 'age'),
    house: randomItemByKey(STUDENT_VALUES, 'house'),
    pet: randomItemByKey(STUDENT_VALUES, 'pet'),
    wand: {
      wood: randomItemByKey(STUDENT_VALUES.wand, 'wood'),
      length: randomItemByKey(STUDENT_VALUES.wand, 'length'),
      core: randomItemByKey(STUDENT_VALUES.wand, 'core')
    }
  };
};

var generateRandomStudents = function generateRandomStudents(number) {
  return Array(number).fill(0).map(generateRandomStudent);
};

var TEST_DATA = generateRandomStudents(25);

// noinspection JSUnusedLocalSymbols
var regexKeyFilter = function regexKeyFilter(map, regex) {
  return filterMap(map, function (key) {
    return regex.test(key);
  });
};

// noinspection JSUnusedLocalSymbols
var mapKeyArrayHasFilter = function mapKeyArrayHasFilter(map, object) {
  return filterMap(map, function (key) {
    return key.includes(object);
  });
};

var getMapKeys = exports.getMapKeys = function getMapKeys(map) {
  var mapKeys = [];
  map.forEach(function (index, key) {
    return mapKeys.push(key);
  });
  return mapKeys;
};

// noinspection JSUnusedLocalSymbols
var mapMap = function mapMap(map, callback) {
  var mappedMap = new Map();

  getMapKeys(map).forEach(function (key) {
    return mappedMap.set(key, callback(key, map.get(key)));
  });

  return mappedMap;
};

function Counter() {
  var _this = this;

  this.count = 0;

  this.increment = function () {
    _this.count = _this.count + 1;

    return _this;
  };
}

var filterMap = exports.filterMap = function filterMap(map, callback) {
  var filteredMap = new Map();

  getMapKeys(map).forEach(function (key) {
    var isTrue = callback(key, map.get(key));

    if (isTrue) {
      filteredMap.set(key, map.get(key));
    }
  });

  return filteredMap;
};

var mapToString = exports.mapToString = function mapToString(array) {
  return array.map(function (item) {
    return item.toString();
  });
};

var compareCodePoints = function compareCodePoints(objectOne, objectTwo) {
  var stringArrayOne = objectOne.toString().split("").map(function (char) {
    return char.codePointAt(0);
  });
  var stringArrayTwo = objectTwo.toString().split("").map(function (char) {
    return char.codePointAt(0);
  });

  while (isNotEmpty(stringArrayOne)) {
    var charOne = stringArrayOne.shift();
    var charTwo = stringArrayTwo.shift();

    if (charOne === charTwo) {
      continue;
    } else {
      return charOne - charTwo;
    }
  }
};

var sortByKey = function sortByKey(key) {
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "string";

  switch (type) {
    case "string":
      return function (a, b) {
        return compareCodePoints(a[key], b[key]);
      };
    case "number":
      return function (a, b) {
        return a[key] - b[key];
      };
    default:
      return function (a, b) {
        return compareCodePoints(a[key], b[key]);
      };
      break;
  }
};

//console.log(TEST_DATA.sort(sortByKey('house')).map(o => o['house']));
var reducer = function reducer(howToReduce) {
  var result = {
    withInitialObject: function withInitialObject(array) {
      return array.reduce(howToReduce, {});
    },
    withInitialArray: function withInitialArray(array) {
      return array.reduce(howToReduce, []);
    }
  };

  return result;
};

var reduce = function reduce(what) {
  var result = {
    by: {
      counting: function counting(how) {
        return reducer(how);
      },
      summing: function summing(how) {
        return reducer(how);
      }
    }
  };

  return result;
};

var columnGetFunction = function columnGetFunction(key) {
  return function (data) {
    return data[key];
  };
};

var row = function row(schema) {
  return function (data) {
    return {
      get: function get(key) {
        return data[key];
      }
    };
  };
};

var resultSet = function resultSet(results) {
  var resultObject = {

    groupBy: null // bloop,
  };

  return resultObject;
};

// const chainable = (clause) => {
//   clause.and = () => {
//   };
//   clause.or = () => {
//   };
// };

var subTable = function subTable(table) {
  table.where = function (keyOrCondition) {
    var where = void 0;

    if (typeof keyOrCondition === "string") {
      var key = keyOrCondition; // rename for clarity
      where = {
        equals: function equals(value) {
          return subTable(table).where(function (row) {
            return row[key] === value;
          });
        }
      };
    } else {
      where = subTable(table.filter(keyOrCondition));
    }

    return where;
  };

  table.groupBy = function (key) {};

  return table;
};

var zeroedObject = function zeroedObject(array, key) {
  return Array.from(new Set(array.map(function (item) {
    return item[key];
  }))).reduce(function (acc, newKey) {
    acc[newKey] = new Counter();
    return acc;
  }, {});
};

var count = function count(key) {
  return function (array) {
    return array.map(function (row) {
      return row[key];
    }).reduce(function (counterObject, value) {
      counterObject[value].increment();
      return counterObject;
    }, zeroedObject(array, key));
  };
};

var group = function group(key) {
  return function (resultSet) {
    return Array.from(new Set(resultSet.map(function (row) {
      return row[key];
    }))).map(function (item) {
      return _defineProperty({}, key, item);
    });
  };
};

var select = function select() {
  for (var _len3 = arguments.length, columns = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    columns[_key3] = arguments[_key3];
  }

  var query = { select: true, from: false, where: false, groupBy: false, limit: false };

  var groupBy = function groupBy() {
    for (var _len4 = arguments.length, keys = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      keys[_key4] = arguments[_key4];
    }

    return function (resultSet) {
      return keys.map(function (key) {
        return group(key)(resultSet);
      });
    };
  };

  var withColumns = function withColumns(table) {
    query.from = true;

    table.groupBy = function () {
      return groupBy.apply(undefined, arguments)(table);
    };

    return table;
  };

  var columnMapper = function columnMapper(row, index) {
    var rowObject = {};
    columns.forEach(function (column) {
      rowObject.id = index;
      rowObject[column] = row[column];
    });
    return rowObject;
  };

  var selectFunction = function selectFunction(resultSet) {
    return resultSet.map(columnMapper);
  };
  selectFunction.from = function (table) {
    return withColumns(subTable(table.map(columnMapper)));
  };

  /*
   table
   .where(restricted) (or | and) .where ...
   // .innerJoin .....
    .groupBy(...)
   .orderBy(...) // any resultset
   .limit(...)   // any
    */

  // () => resultSet(table.map(columnMapper));

  return selectFunction;
};

console.log(count('house')(select("house").from(TEST_DATA)));
console.log(select("house", "pet").from(TEST_DATA).groupBy('house', "pet"));

// SELECT: (...columns) => function that maps each row to those column values

var table = function table(arrayOfObjects) {
  var self = {};
  var tokenObject = arrayOfObjects[0];

  self.rows = arrayOfObjects;
};

// console.log(generateRandomStudents(10).map(student =>
//   `insert into wands (wood, length, core) values ('${student.wand.wood}', ${student.wand.length},
// '${student.wand.core}');\ninsert into hp_students (age, house, pet, wand_id) values (${student.age},
// '${student.house}', '${student.pet}', (select count(id) from wands));\n`).join(" "));