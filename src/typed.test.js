import { TypedFunction } from './Overload';
import { Signature } from './Signature';
import { TYPES } from "./Types";
import { Interface, RequirementCollection } from "./Interface";
import { SimpleType } from "./SimpleType";

describe('typed functions should type', () => {
  const stringAdder = new TypedFunction(new Signature(TYPES.STRING, TYPES.STRING), (a, b) => a + b);

  it('should not allow wrong types', () => {
    expect(() => stringAdder(1, 2)).toThrow();
    expect(() => stringAdder("a", "b").not.toThrow());
    expect(stringAdder("a", "b")).toBe("ab");
  });
});


describe('bleh type', () => {

  it('jkljklj', () => {
    const Sortable = new Interface();
    const sortableRequirements = new RequirementCollection();
    const Sorter = new TypedFunction(
      new Signature(TYPES.NUMBER, TYPES.NUMBER), (a, b) => a - b);

    sortableRequirements.add(
      SimpleType('sort', { sort: Sorter })
    );

    Sortable.define(sortableRequirements);
    const base = Sortable.getUnimplementedBase();
    expect(() => base.confirm()).toThrow();
    const badSort = () => {
    };
    expect(() => base.implement('badSort', badSort)).toThrow();
    expect(() => base.implement('sort', badSort)).toThrow();

    const sort = new TypedFunction(
      new Signature(TYPES.NUMBER, TYPES.NUMBER), (a, b) => a - b
    );

    expect(() => base.implement('sort', sort)).not.toThrow();
    const Classer = base.confirm();
    let bob = new Classer();
    console.log(Classer);
    console.log(bob);
    console.log(bob.sort(3, 4));
  });
});
