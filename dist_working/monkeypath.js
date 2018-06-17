'use strict';

var _templateObject = _taggedTemplateLiteral(['\n  const ', ' = ', ';\n'], ['\n  const ', ' = ', ';\n']);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

function monkeypatch(strings) {
  // console.log(strings.map(s => s.trim()));
  console.log(strings);

  for (var _len = arguments.length, slots = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    slots[_key - 1] = arguments[_key];
  }

  console.log(slots);
}

var variableName = 'apple';
var value = 15;

var testInput = monkeypatch(_templateObject, variableName, value);