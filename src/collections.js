import { Interface } from './Interface';
import { Signature } from "./Signature";
import { TypedCollection } from './TypedCollection';
import { EmptyOverload } from "./Overload";
import { TYPES } from "./Types";

console.log(new Signature());

// one-, two-axis     : array, map
// yes/no sort
// yes/no duplicates



class Collections {
  static utils = {}
}

const GenericCollectionInterface = GenericType => {
  const GenericCollection = TypedCollection(GenericType.name, GenericType);

  return Interface.from({
    add: new Signature(GenericType),
    addAll: new Signature(GenericCollection),
    clear: new Signature(),
    contains: new Signature(GenericType),
    containsAll: new Signature(GenericCollection),
    equals: new Signature(GenericType),
    isEmpty: new Signature(),
    remove: new Signature(GenericType),
    removeAll: new Signature(GenericCollection),
    // removeIf: new Signature(predicate),
    retainAll: new Signature(GenericCollection),
    size: new Signature(),
    toArray: new Signature(),
    hashCode: new Signature(),
    iterator: new Signature(),
    parallelStream: new Signature(),
    spliterator: new Signature(),
    stream: new Signature(),
  });
};

const ListInterface = GenericType => {
  const GenericCollection = TypedCollection(GenericType.name, GenericType);

  return Interface.from({
    add: [
      new Signature(GenericType),
      new Signature(TYPES.NUMBER, GenericType)
    ],
    addAll: [],

  }).implements(GenericCollectionInterface(GenericType));
};
