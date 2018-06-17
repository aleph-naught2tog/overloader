'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _manipulations = require('./manipulations');

var STUDENT_VALUES = {
  age: (0, _manipulations.range)(10, 18),
  house: ['gryffindor', 'hufflepuff', 'ravenclaw', 'slytherin'],
  pet: ['cat', 'rat', 'dog', 'toad', 'owl', 'ferret', 'hippogriff'],
  wand: {
    wood: ['holly', 'oak', 'yew', 'willow'],
    length: (0, _manipulations.range)(10, 15, 0.5),
    core: ['unicorn hair', 'phoenix feather', 'veela hair', 'kneazle whisper', 'dragon heartstring']
  }
};

var generateRandomStudent = function generateRandomStudent() {
  return {
    age: (0, _manipulations.randomItemByKey)(STUDENT_VALUES, 'age'),
    house: (0, _manipulations.randomItemByKey)(STUDENT_VALUES, 'house'),
    pet: (0, _manipulations.randomItemByKey)(STUDENT_VALUES, 'pet'),
    wand: {
      wood: (0, _manipulations.randomItemByKey)(STUDENT_VALUES.wand, 'wood'),
      length: (0, _manipulations.randomItemByKey)(STUDENT_VALUES.wand, 'length'),
      core: (0, _manipulations.randomItemByKey)(STUDENT_VALUES.wand, 'core')
    }
  };
};

var generateRandomStudents = function generateRandomStudents(number) {
  return Array(number).fill(0).map(generateRandomStudent);
};

var TEST_DATA = generateRandomStudents(10);

exports.default = StudentBody;