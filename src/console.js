console.log("---------------------");

const first = [{ a: 1, b: 2, c: 3 }];
const second = [{ a: 1 }, { b: 2 }, { c: 3 }];
console.log(first);
console.log(second);

const testSpread = array => {
  return array.reduce((arraySoFar, object)=> {
    let result;

    if (Object.keys(object).length > 1) {
      result = Object.keys(object).map(key => ({[key]: object[key]}));
    } else {
      result = ({ [Object.keys(object)[0]]: object[Object.keys(object)[0]] });
    }

    return arraySoFar.concat(result);
  }, []);
};

console.log(testSpread(first));
console.log(testSpread(second));