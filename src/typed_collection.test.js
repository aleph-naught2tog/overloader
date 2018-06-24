import { NumericArray, StringArray, TypedCollection } from './TypedCollection';
import { TYPES } from './Types';
import { UnionType } from "./UnionType";

describe('typed collection', () => {

  describe('strings', () => {
    const stringArray = new StringArray();

    it('should accept strings', () => {
      expect(() => stringArray.add("apple")).not.toThrow();
    });

    it('should reject non-strings', () => {
      expect(() => stringArray.add(44)).toThrow();
    });

  });

  describe('numbers', () => {
    const numericArray = new NumericArray();

    it('should accept numbers', () => {
      expect(() => numericArray.add(12)).not.toThrow();
    });

    it('should reject strings', () => {
      expect(() => numericArray.add("horse")).toThrow();
    })
  });
});

describe('complex collection', () => {
  const Colorable = UnionType("Colorable", { color: TYPES.STRING });
  const ColorCollection = TypedCollection(Colorable);

  it('should allow construction', () => {
    expect(() => new ColorCollection()).not.toThrow();
  });

  it('should allow colors to be added', () => {
    const collection = new ColorCollection();
    expect(() => collection.add(Colorable.cast({color: 'blue'}))).not.toThrow();
    expect(() => collection.add({color: 'pink'})).not.toThrow();
  });

  it('should not allow non-colors', () => {
    const collection = new ColorCollection();
    expect(() => collection.add({color: 15})).toThrow();
    expect(() => collection.add(15)).toThrow();
    expect(() => collection.add({bagel: 12})).toThrow();
  });

  it('should have items', () => {
    const collection = new ColorCollection();
    collection.add({color: 'blue'});
    collection.add({color: 'pink'});
    collection.add({color: 'apple'});
    expect(collection.size()).toBe(3);
  });
});