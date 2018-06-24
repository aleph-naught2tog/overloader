const processLine = (line) => {
  console.log(line.split(/\b/));
};

const parse = string => {
  const lines = string.split(/\n/);
  console.log(lines);

  lines.forEach(processLine);
};


// try compiling
const testString = `
  // should be fine
  String stringVariable = "apple";
  
  // should fail
  Number otherVariable = "apple";
  
  lines.forEach(processLine);
`;

parse(testString);