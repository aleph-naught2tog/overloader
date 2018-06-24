import { getTypeNameOf} from "./Types";
import { TYPES } from "./Types";

export class DefinedBy {
  constructor(someObject) {

    this.canonical =
      Object.keys(someObject)
            .reduce((keysCoveredSoFar, currentKey) => {
              return ( {
                ...keysCoveredSoFar,
                [currentKey]: getTypeNameOf(someObject[currentKey])
              } );
            }, {});

    TYPES.register(this.toString(), this.canonical);
  }

  toString() {
    return Object.keys(this.canonical)
                 .map(key => `${key}:${this.canonical[key]}`)
                 .join();
  }
}