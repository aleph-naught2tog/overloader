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

var isIterable = exports.isIterable = function isIterable(value) {
  return value instanceof Array || value instanceof Set;
};

var isNumber = exports.isNumber = function isNumber(value) {
  return !isNaN(value);
};
var isNotANumber = exports.isNotANumber = function isNotANumber(value) {
  return isNaN(value);
};
var isString = exports.isString = function isString(value) {
  return typeof value === 'string';
};
var isNotString = exports.isNotString = function isNotString(value) {
  return typeof value !== 'string';
};
var isArray = exports.isArray = function isArray(value) {
  return Array.isArray(value);
};
var isNotArray = exports.isNotArray = function isNotArray(value) {
  return !isArray(value);
};
var isSet = exports.isSet = function isSet(value) {
  return value instanceof Set;
};
var isNotSet = exports.isNotSet = function isNotSet(value) {
  return !isSet(value);
};
var isNotEmpty = exports.isNotEmpty = function isNotEmpty(value) {
  return isArray(value) && value.length !== 0;
};

// noinspection EqualityComparisonWithCoercionJS
var isFalsy = exports.isFalsy = function isFalsy(value) {
  return value == false;
}; // intentional ==
// noinspection EqualityComparisonWithCoercionJS
var isTruthy = exports.isTruthy = function isTruthy(value) {
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

var Student = function Student(_ref) {
  var age = _ref.age,
      house = _ref.house,
      pet = _ref.pet,
      _ref$wand = _ref.wand,
      wood = _ref$wand.wood,
      length = _ref$wand.length,
      core = _ref$wand.core;
  return {
    age: age,
    house: house,
    pet: pet,
    wand: { wood: wood, length: length, core: core }
  };
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

var _filterBy_3 = function _filterBy_3(array, key, targetValue) {
  return array.filter(function (item) {
    return item[key] === targetValue;
  });
};

var _filterBy_2 = function _filterBy_2(array, condition) {
  return array.filter(condition);
};