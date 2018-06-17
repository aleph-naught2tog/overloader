'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.flattenDeep = flattenDeep;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = require('util').inspect;

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
function flattenDeep(arr1) {
  return arr1.reduce(function (acc, val) {
    return Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val);
  }, []);
}

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

var TEST_DATA = exports.TEST_DATA = generateRandomStudents(25);

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

var uniqueArray = function uniqueArray(array) {
  return Array.from(new Set(array));
};

var array = TEST_DATA;

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

var counter = 0;

var OR = Symbol("or");
var AND = Symbol("and");

var Table = function Table(array) {
  _classCallCheck(this, Table);

  _initialiseProps.call(this);

  this.root = array;

  this.whereConditions = [];
  this.groupByColumns = [];
};

var _initialiseProps = function _initialiseProps() {
  var _this = this;

  this.where = function (rowPredicate, operator) {
    _this.table = array.filter(rowPredicate);

    return {
      or: { where: function where(conditional) {
          return _this.where(conditional, OR);
        } },
      and: { where: function where(conditional) {
          return _this.where(conditional, OR);
        } }
    };
  };
};

Table.beepBloop = function () {
  return "apple";
};

var bob = new Table([]);
//console.log(require('util').inspect(bob));

var table = [{ row: ++counter, first: "bob", last: "bobberson", age: 25 }, { row: ++counter, first: "tom", last: "tommerson", age: 12 }, { row: ++counter, first: "diane", last: "dianerson", age: 28 }];

var identity = function identity(x) {
  return x;
};
var selectKey = function selectKey(key) {
  return function (row) {
    return row[key];
  };
};

var columnConcat = function columnConcat() {
  for (var _len3 = arguments.length, keys = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    keys[_key3] = arguments[_key3];
  }

  return function (row) {
    return keys.map(function (key) {
      return selectKey(key)(row);
    }).join(" ");
  };
};
var defaultColumnName = function defaultColumnName(action, keys) {
  return action.name + ' ( ' + keys.join() + ' )';
};

var multiSelectAction = function multiSelectAction(keys) {
  var action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : columnConcat;
  var as = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : defaultColumnName(action, keys);
  return function (row) {
    return _defineProperty({}, as, action.apply(undefined, _toConsumableArray(keys))(row));
  };
};

var selectAction = function selectAction(key) {
  var action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : identity;
  return function (row) {
    return _defineProperty({}, key, action(selectKey(key)(row)));
  };
};
// var selectAction = (key, action = identity) => row => ({ key: key, result: action(selectKey(key)(row)) });

var doSelectOnFrom = function doSelectOnFrom(selectActions, inputTable) {
  return inputTable.map(function (row) {
    return selectActions.reduce(function (returnRowThusFar, singleSelectAction) {

      return _extends({}, returnRowThusFar, singleSelectAction(row));
    }, {}
    // [singleSelectAction(row).key]: singleSelectAction(row).result })
    );
  });
};

var select = function select() {
  for (var _len4 = arguments.length, actions = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    actions[_key4] = arguments[_key4];
  }

  return { from: function from(array) {
      return doSelectOnFrom(actions, array);
    } };
};

var simpleSelect = select(selectAction('row'), selectAction('age')).from(table);

var multiSelect = select(selectAction('row'), multiSelectAction(['first', 'last']), selectAction('age')).from(table);

var logger = require('util').inspect;

//console.log(logger(multiSelect));