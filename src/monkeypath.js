function monkeypatch(strings, ...slots) {
  // console.log(strings.map(s => s.trim()));
  console.log(strings);
  console.log(slots);
}

let variableName = 'apple';
let value = 15;

let testInput = monkeypatch`
  const ${variableName} = ${value};
`;
