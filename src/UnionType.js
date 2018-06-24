import { NamedType } from "./NamedType";
import { flatten } from "./manipulations";

const unionInstanceCheck = (array, rawTypes) => (oneTypeAsString, typeAsObject) => {
  let flatType;

  if (( typeAsObject instanceof Object ) && !Array.isArray(typeAsObject)) {
    flatType = flatten([typeAsObject]);
  } else {
    flatType = typeAsObject;
  }

  if (Array.isArray(flatType)) {
    for (let type of flatType) {

      let foundType = rawTypes.find(MajorType => {
        try {
          return ( type instanceof MajorType );
        } catch (error) {
          return false;
        }
      });

      if (foundType) {
        return true;
      }
    }
  }

  return array.includes(oneTypeAsString);
};

export const UnionType = (name, ...types) => NamedType(name, unionInstanceCheck, ...types);