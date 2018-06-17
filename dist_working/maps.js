'use strict';

var _TYPE_DICT;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _Signature = require('./Signature');

var _manipulations = require('./manipulations');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var STRING = "1string";
var NUMBER = "1number";
var ARRAY = "1array";

var STRING_STRING = [STRING, STRING];
var STRING_NUMBER = [STRING, NUMBER];
var STRING_ARRAY = [STRING, ARRAY];
var STRING_ARRAY_SUB_STRING = [STRING, [STRING]];

var SET_OF_KEYS = [STRING_STRING, STRING_NUMBER, STRING_ARRAY, STRING_ARRAY_SUB_STRING];

var TYPE_DICT = (_TYPE_DICT = {}, _defineProperty(_TYPE_DICT, _typeof("apple"), STRING), _defineProperty(_TYPE_DICT, _typeof(15), NUMBER), _defineProperty(_TYPE_DICT, [].constructor.name, ARRAY), _TYPE_DICT);

var map = new Map();

map.set(["string", "string"], "hardcoded string string array");
map.set([STRING, STRING], "array with string constants");
map.set(STRING_STRING, "STRING_STRING constant");

var accessViaAnotherHardcoded = map.get(["string", "string"]);
var accessViaArrayWithStringConstants = map.get([STRING, STRING]);
var accessViaConstant = map.get(STRING_STRING);

console.log('hardcoded', accessViaAnotherHardcoded);
console.log('string, strign', accessViaArrayWithStringConstants);
console.log('constant', accessViaConstant);

var getConstant = function getConstant() {
  for (var _len = arguments.length, arrayOfArguments = Array(_len), _key = 0; _key < _len; _key++) {
    arrayOfArguments[_key] = arguments[_key];
  }

  console.log((0, _Signature.mapTypes)(arrayOfArguments).map(function (item) {
    return TYPE_DICT[item];
  }));
};

getConstant("orange", 343, ["dsa"]);

var testArrays = [["apple", "apple", "bear"], ["apple", "bear", "apple"], ["bear", "apple"], ["apple", "bear", "bear"]];

var reducedByLength = testArrays.reduce(function (arraysByLength, currentArray) {

  var currentLength = currentArray.length;

  if ((0, _manipulations.doesNotHaveKey)(arraysByLength, currentLength.toString())) {
    arraysByLength[currentLength] = [];
  }

  arraysByLength[currentLength].push(currentArray);

  return arraysByLength;
}, {});

var reduceByTerm = function reduceByTerm(array) {
  return array.reduce(function (arraysByCommonTerms, currentArray) {

    var index = 0;
    var term = currentArray[index];

    if ((0, _manipulations.doesNotHaveKey)(arraysByCommonTerms, term)) {
      arraysByCommonTerms[term] = [];
    }

    arraysByCommonTerms[term].push(currentArray);

    return arraysByCommonTerms;
  }, {});
};

var reducedByFirstTerm = Object.keys(reducedByLength).map(function (key) {
  return reduceByTerm(reducedByLength[key]);
});

reducedByFirstTerm.forEach(console.log);