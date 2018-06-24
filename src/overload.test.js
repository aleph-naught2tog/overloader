import { Signature} from "./Signature";
import { withOverload } from "./Overload";
import { UnionType } from "./UnionType";
import { IntersectionType } from "./IntersectionType";
import { TYPES } from "./Types";

test('1+1 is true', () => {
  expect(1 + 1).toBe(2);
});

describe('overload', () => {
  let bob = withOverload(x => x);
  bob.overloads
     .add({
       signature: new Signature("a", 1),
       method: (a, b) => [b, a],
       pipe: true
     })
     .add({
       signature: new Signature(1, "a"),
       method: (a, b) => `${a} ${b}`
     })
     .add({
       signature: new Signature("a", 1, "c"),
       method: (a, b, c) => [`${a}${c}`, b],
       pipe: true
     })
     .add({
       signature: new Signature(),
       method: () => "orange"
     })
  ;

  test('it works', () => {
    expect(bob(10, "apple")).toBe("10 apple");
    expect(bob("orange", 12)).toBe("12 orange");
    expect(bob("red", 55, "green")).toBe("55 redgreen");
  });
});

describe('union types', () => {
  const Concattable = UnionType('Concattable', TYPES.STRING, TYPES.NUMBER);

  const bloop = withOverload(x => x, true);
  bloop.overloads.add({
    signature: new Signature(Concattable, Concattable),
    method: (a, b) => a + b
  });

  test('union types are recognized', () => {
    const newConcat1 = new Concattable("orange");
    const newConcat2 = new Concattable(12);

    expect(bloop(newConcat1, newConcat2)).toBe("orange12");
  });
});

describe('types enforce themselves', () => {
  const hasColor = { color: TYPES.STRING };

  const Colorable = UnionType('Colorable', hasColor);
  const Readable = UnionType('Readable', {
    read: () => {
    }
  });

  const IsReadableOrColorable = UnionType('IsReadableOrColorable', Readable, Colorable);

  describe('colorable', () => {
    it('should not allow plain strings', () => {
      expect(() => new Colorable("green")).toThrowError();
    });

    it('should not allow numbers', () => {
      expect(() => new Colorable({ color: 12 })).toThrow();
    });

    it('should allow {color: "blue"}', () => {
      expect(new Colorable({ color: 'blue' })).toHaveProperty('color', 'blue');
    });
  });

  describe('readable', () => {
    it('should not allow strings', () => {
      expect(() => new Readable("apple")).toThrow();
    });

    it('should not allow objects without readable', () => {
      expect(() => new Readable({ color: 'orange' })).toThrow();
    });

    it('should fail with a plain lambda', () => {
      expect(() => new Readable(() => 15)).toThrow();
    });

    it('should have method called read', () => {
      const readable = new Readable({ read: string => string });
      expect(readable.read("apple")).toBe("apple");
    });
  });

  describe('union', () => {
    const read = new Readable({ read: string => string });
    const color = new Colorable({ color: 'orange' });

    it('should allow raw colors', () => {
      expect(() => new IsReadableOrColorable({ color: 'orange' })).not.toThrow();
    });

    it('should should recognize colors', () => {
      expect({ color: 'orange' } instanceof Colorable).toBeTruthy();
    });

    it('should should recognize colors as isreadableorcolorable', () => {
      expect({ color: 'orange' } instanceof IsReadableOrColorable).toBeTruthy();
    });

    it('should allow readables', () => {
      expect(() => new IsReadableOrColorable(read)).not.toThrow();
    });

    it('should allow colorables', () => {
      expect(() => new IsReadableOrColorable(color)).not.toThrow();
    });

    it('should reject non-readable, non-colorables', () => {
      expect(() => new IsReadableOrColorable("apple")).toThrow();
    });

    it('should allow objects with readable and colorable', () => {
      expect(() => new IsReadableOrColorable(
        { color: 'blue', read: string => string }
      )).not.toThrow();
    });

    it('should allow objects with readable or colorable, and something else', () => {
      expect(() => new IsReadableOrColorable(
        { color: 'blue', read: string => string, age: 12 }
      )).not.toThrow();

      expect(() => new IsReadableOrColorable(
        { color: 'blue', age: 12 }
      )).not.toThrow();

      expect(() => new IsReadableOrColorable(
        { read: string => string, age: 12 }
      )).not.toThrow();
    });

    it('should allow type mismatches as long as there is one correct type', () => {
      expect(() => new IsReadableOrColorable(
        { color: 15, age: 12 }
      )).toThrow();

      expect(() => new IsReadableOrColorable(
        { color: 15, read: string => string, age: 12 }
      )).not.toThrow();
    });
  });
});

describe('intersection types', () => {
  const Readable = UnionType('Readable', { read: string => string });
  const Colorable = UnionType('Colorable', { color: TYPES.STRING });

  const read = new Readable({ read: string => string });
  const color = new Colorable({ color: 'orange' });

  const MustBeColorableAndReadable =
    IntersectionType('MustBeColorableAndReadable', Readable, Colorable);

  it('must have all properties', () => {
    expect(() => new MustBeColorableAndReadable(
      { color: 'blue', horse: 15 }
    )).toThrow();
  });

  it('must have all properties listed', () => {
    expect(() => new MustBeColorableAndReadable(
      { read: () => "apple" }
    )).toThrow();
  });

  it('should allow extra properties if all properties present', () => {
    expect(() => new MustBeColorableAndReadable(
      { color: 'blue', read: () => "apple", horse: 15 }
    )).not.toThrow();
  });

  it('should allow exact matches', () => {
    expect(() => new MustBeColorableAndReadable(
      { color: 'blue', read: () => "apple" }
    )).not.toThrow();
  });

  it('should not allow wrong types for correct keys', () => {
    expect(() => new MustBeColorableAndReadable(
      { color: 'blue', read: 12 }
    )).toThrow();
  });
});

describe('typings cascades as expected', () => {
  const sayHello = withOverload(x => x, false);
  const BigCat = UnionType('BigCat', { meow: () => TYPES.STRING });
  const BigDog = UnionType('BigDog', { bark: () => TYPES.STRING });

  sayHello.overloads
          .add({
            signature: new Signature({ bark: () => "woof" }),
            method: barker => ("bark says:" + barker.bark())
          })
          .add({
            signature: new Signature({ meow: () => "meow" }),
            method: meower => ("meow says: " + meower.meow())
          })
          .add({
            signature: new Signature(BigCat),
            method: bigCat => ("big cat says: " + bigCat.meow())
          })
          .add({
            signature: new Signature(BigDog),
            method: bigDog => ("big dog says: " + bigDog.bark())
          })
  ;

  it('should fail for wrong types', () => {
    expect(() => sayHello(15)).toThrow();
  });

  it('should work', () => {
    expect(() => new BigCat({meow: () => "apple"})).not.toThrow();

    const bigCat = new BigCat({meow: () => "apple"});
    console.log(bigCat);
    expect(bigCat.meow()).toBe("apple");
    expect(() => sayHello(bigCat)).not.toThrow();

    expect(() => sayHello({ bark: () => "woof" })).not.toThrow();
  });
});