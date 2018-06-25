import { TypedFunction } from './Overload';
import { Signature } from './Signature';
import { TYPES } from "./Types";
import { TypedCollection } from "./TypedCollection";

export const RequirementCollection = TypedCollection('RequirementCollection', TYPES.SIMPLE_TYPE);

const classmaker = (props, baseClass = class {
}) => {

  const buildingClass = class extends baseClass {
    constructor(...args) {
      super(...args);
    }
  };

  props.forEach((value, propName) => {
    const key = Symbol.keyFor(propName);
    Object.defineProperty(buildingClass.prototype, key, { value: value });
  });

  return buildingClass;
};

class UnusableClass {

  static get(interfaceObject) {
    return new UnusableClass(interfaceObject);
  }

  constructor(self) {
    const requirements = self.requirements;
    this.requirements = new Map();
    requirements.forEach(requirement => {
      const key = requirement.name;
      this.requirements.set(Symbol.for(key), requirement.value);
    });
    this.implementations = new Map();
  }

  implement(name, namedFunction) {
    if (namedFunction.type !== TypedFunction) {
      throw new Error("not typed");
    }

    const methodName = Symbol.for(name);

    if (this.requirements.has(methodName)) {
      const otherFunction = this.requirements.get(methodName);

      if (namedFunction.ownSignature.equals(otherFunction.signature)) {
        this.implementations.set(methodName, namedFunction);
        this.requirements.delete(methodName);
      } else {
        throw new Error("wrong signature");
      }
    }
  }

  getRemainingToBeImplemented() {
    return this.requirements.keys();
  }

  getImplementations() {
    return this.implementations.keys();
  }

  confirm() {
    if (this.requirements.size !== 0) {
      throw new Error("You have not implemented all required methods.");
    } else {
      return classmaker(this.implementations);
    }
  }
}

const DefType = new Signature(RequirementCollection);

export class Interface {
  static types = {
    define: self =>
      TypedFunction(DefType, (requirements) => {
        self.requirements = requirements;
        return self;
      })
  };

  define(requirements) {
    return Interface.types.define(this)(requirements);
  };

  getUnimplementedBase() {
    return UnusableClass.get(this);
  }
}
