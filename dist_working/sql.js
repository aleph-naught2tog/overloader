"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _overload = require("./overload");

var _manipulations = require("./manipulations");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var array = _manipulations.TEST_DATA;

/*
 SELECT:
 I: takes an array of keys + what to do with them
 O: a function that
 _i: array of rows
 _o: transformed array of rows

 FROM:.
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
  for (var _len = arguments.length, keys = Array(_len), _key = 0; _key < _len; _key++) {
    keys[_key] = arguments[_key];
  }

  return function (row) {
    return keys.map(function (key) {
      return selectKey(key)(row);
    }).join(" ");
  };
};
var defaultColumnName = function defaultColumnName(action, keys) {
  return action.name + " ( " + keys.join() + " )";
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
  for (var _len2 = arguments.length, actions = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    actions[_key2] = arguments[_key2];
  }

  return { from: function from(array) {
      return doSelectOnFrom(actions, array);
    } };
};

var simpleSelect = select(selectAction('row'), selectAction('age')).from(table);

var multiSelect = select(selectAction('row'), multiSelectAction(['first', 'last']), selectAction('age')).from(table);

var logger = require('util').inspect;

select(selectAction('row'), selectAction('age')).from(table).where();