import { TEST_DATA } from "./manipulations";

let array = TEST_DATA;

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

const table = [
  { row: ++counter, first: "bob", last: "bobberson", age: 25 },
  { row: ++counter, first: "tom", last: "tommerson", age: 12 },
  { row: ++counter, first: "diane", last: "dianerson", age: 28 }
];

const identity = x => x;
const selectKey = key => row => row[key];

const columnConcat = (...keys) => row => keys.map(key => selectKey(key)(row)).join(" ");
const defaultColumnName = (action, keys) => `${action.name} ( ${keys.join()} )`;

const multiSelectAction = (keys, action = columnConcat, as = defaultColumnName(action, keys)) => row => ( { [as]: action(...keys)(row) } );

const selectAction = (key, action = identity) => row => ( { [key]: action(selectKey(key)(row)) } );
// var selectAction = (key, action = identity) => row => ({ key: key, result: action(selectKey(key)(row)) });

const doSelectOnFrom =
  (selectActions, inputTable) => inputTable.map(
    row =>
      selectActions.reduce(
        (returnRowThusFar, singleSelectAction) => {
          return ( { ...returnRowThusFar, ...singleSelectAction(row) } );
        }, {}
        // [singleSelectAction(row).key]: singleSelectAction(row).result })
      )
  );

const select = (...actions) => ( { from: array => doSelectOnFrom(actions, array) } );


const simpleSelect =
  select(selectAction('row'), selectAction('age'))
    .from(table);

const multiSelect =
  select(selectAction('row'), multiSelectAction(['first', 'last']), selectAction('age'))
    .from(table);

var logger = require('util').inspect;

select(selectAction('row'), selectAction('age')).from(table).where();