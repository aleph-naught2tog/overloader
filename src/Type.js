import { TYPES } from "./Types";

export class Type {
  static [Symbol.hasInstance](maybeType) {
    const typeName = maybeType.constructor.name;

    if (!typeName) {
      throw new Error(`${maybeType} has no constructor name to check.`);
    }

    const doesExist = TYPES.REGISTRY.HAS(typeName);

    if (doesExist) {
      maybeType.class = typeName;
    }

    return doesExist;
  }
}
