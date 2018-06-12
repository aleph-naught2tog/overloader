'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
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
    length: range(10, 15, 0.5),
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

var TEST_DATA = generateRandomStudents(10);

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