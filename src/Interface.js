import { TypedFunction } from './Overload';
import { Signature } from './Signature';
import { TYPES } from "./Types";
import { TypedCollection } from "./TypedCollection";

TYPES.iterable = {
  of: SomeType => {
    return new TypedCollection(SomeType);
  }
};

class Interfaces {
  static types = {
    define: TypedFunction(new Signature(TYPES.iterable.of(SomeType)), methodDefinitions => {})
  };
  static define = Interfaces.types.define;
}

const interface = Interfaces.define(requirements);
const Wrapper = interface.implementation();
Wrapper.open();
Wrapper
  .implement(functionName, functionBody)
  .implement(functionName, functionBody);
Wrapper.close();