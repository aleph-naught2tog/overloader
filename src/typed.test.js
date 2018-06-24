import { TypedFunction } from './Overload';
import { Signature} from './Signature';
import { TYPES } from "./Types";

describe('typed functions should type', () => {
  const stringAdder = new TypedFunction(new Signature(TYPES.STRING, TYPES.STRING), (a,b) => a + b);
  console.log(stringAdder("a", "b"));
  it('should not allow wrong types', () => {
    expect(() => stringAdder(1,2)).toThrow();
    expect(() => stringAdder("a", "b").not.toThrow());
    expect(stringAdder("a", "b")).toBe("ab");
  });
});