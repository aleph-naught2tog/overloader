import { Type } from "./Type";
import { getTypeNameOf, TYPES } from "./Types";

export const mapTypes = (parameters) => parameters.map(p => getTypeNameOf(p));

export function Signature(...parameters) {
  if (parameters.length === 0) {
    this.structure = [TYPES.VOID];
  } else {
    this.structure = mapTypes(parameters);
  }

  this.allowsAny = this.structure.includes(TYPES.ANY);

  this.length = parameters.length;

  this.equals = (otherSignature) => {
    let result = false;
    if (otherSignature instanceof Signature) {
      if (otherSignature.length === this.length) {
        result = this.structure.every(
          (currentParameter, index) => currentParameter === otherSignature.structure[index]
        );
      }
    }
    return result;
  };
}

export function NoSuchSignatureError(signature) {
  this.name = 'NoSuchSignatureError';
  // noinspection JSUnusedGlobalSymbols
  this.message = `No function matching signature <${signature}> found.`;
}

export function NoSignatureOfLengthError(signature, overloadedFunction) {
  this.name = 'NoSignatureOfLengthError';
  // noinspection JSUnusedGlobalSymbols
  this.message = `No function with a signature <${signature}> of length ${signature.length} was found.
Did you mean:
    ${overloadedFunction.getSignaturesOfLength(signature.length).map(signature => `* ${signature.toString()}`)}`;
}