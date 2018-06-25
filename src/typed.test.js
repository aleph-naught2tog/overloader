import { EmptyTypedFunction, TypedFunction } from './Overload';
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
    const Sorter = new EmptyTypedFunction(new Signature(TYPES.NUMBER, TYPES.NUMBER));
    const Echoer = new EmptyTypedFunction(new Signature(TYPES.STRING));

    sortableRequirements.add(
      SimpleType('sort', { sort: Sorter })
    );
    sortableRequirements.add(
      SimpleType('echo', { echo: Echoer })
    );

    Sortable.define(sortableRequirements);
    const base = Sortable.getUnimplementedBase();
    const badSort = () => {};
    expect(() => base.confirm()).toThrow();
    expect(() => base.implement('badSort', badSort)).toThrow();
    expect(() => base.implement('sort', badSort)).toThrow();

    const sort = new TypedFunction(
      new Signature(TYPES.NUMBER, TYPES.NUMBER), (a, b) => a - b
    );

    expect(() => base.implement('sort', sort)).not.toThrow();
    expect(() => base.confirm()).toThrow();

    const echo = new TypedFunction(
      new Signature(TYPES.STRING), a => a
    );

    expect(() => base.implement('echo', echo)).not.toThrow();
    expect(() => base.confirm()).not.toThrow();

    const Classer = base.confirm();
    let bob = new Classer();

    console.log(bob.echo("apple"));
    expect(bob.sort(1,4)).toBe(-3);
    expect(bob.echo("apple")).toBe("apple");
  });
});
