import { EmptyTypedFunction, TypedFunction } from './Overload';
import { Signature } from './Signature';
import { TYPES } from "./Types";
import { TypedCollection } from "./TypedCollection";
import { SimpleType } from "./SimpleType";

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
    if (!Array.isArray(namedFunction) && namedFunction.type !== TypedFunction) {
      throw new Error("not typed");
    }

    const methodName = Symbol.for(name);

    if (this.requirements.has(methodName)) {
      const otherFunction = this.requirements.get(methodName);

      if (Array.isArray(otherFunction) && otherFunction.length >= 1) {

        otherFunction.forEach(functionObject => {
          namedFunction.forEach(otherObject => {
            if (otherObject.ownSignature.equals(functionObject.signature)) {

              if (this.implementations.has(methodName)) {
                this.implementations.get(methodName).push(otherObject);
              } else {
                this.implementations.set(methodName, [otherObject]);
              }

              const found = this.requirements
                                .get(methodName)
                                .findIndex(object => otherObject.ownSignature.equals(object.signature));

              this.requirements.get(methodName).splice(found, 1);
            }
          });
        });

      } else if (namedFunction.ownSignature.equals(otherFunction.signature)) {

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
    console.log(this.requirements);
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

  static from(interfaceObject) {
    const requirements = new RequirementCollection();

    Object.keys(interfaceObject).forEach(key => {
      let temporaryType;
      if (interfaceObject[key].length > 1 && Array.isArray(interfaceObject[key])) {
        let overloadArray = interfaceObject[key];
        let result = overloadArray.map(overload => new EmptyTypedFunction(overload));
        temporaryType = new SimpleType(key, {
          [key]: result
        });
      } else {
        temporaryType = new SimpleType(key,
          { [key]: new EmptyTypedFunction(interfaceObject[key]) }
        );
      }
      requirements.add(temporaryType);
    });

    let thisInterface = new Interface();

    return thisInterface.define(requirements);
  }

  implements(otherInterface) {
    let requirements = new RequirementCollection();
    let oldReqs = this.requirements;
    requirements = oldReqs.merge(otherInterface.requirements);
    this.requirements = requirements;
    return this;
  }
}


