import { NamedType } from "./NamedType";
import { flatten } from "./manipulations";

const intersectionInstanceCheck = (array, rawTypes) => {
  return (oneTypeAsString, typeAsObject) => {
    let flatType;

    if (( typeAsObject instanceof Object ) && !Array.isArray(typeAsObject)) {
      flatType = flatten([typeAsObject]);
    } else {
      flatType = typeAsObject;
    }

    if (Array.isArray(flatType)) {
      return rawTypes.map(MajorType => {
        const foundMatch = flatType.find(minorType => ( minorType instanceof MajorType ));

        return foundMatch;
      }).every(result => result);
    }

    console.log("here");
    return array.includes(oneTypeAsString);
  };
};

export const IntersectionType = (name, ...types) => NamedType(name, intersectionInstanceCheck, ...types);