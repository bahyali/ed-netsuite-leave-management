module.exports = {
  "automock": false,
  "clearMocks": true,
  "moduleDirectories": [
    "node_modules",
    "src",
    "."
  ],
  "moduleNameMapper": {
    "N/(.*)": "<rootDir>/src/tests/Mocks/N/$1",
  },
  "testRegex": "(/test/.*|(\\.|/)(test|spec))\\.(tsx?)$",
  "globals": {
    "ts-jest": {
      "diagnostics": {
        "warnOnly": false
      }
    }
  },
  "preset": "ts-jest",
  "testMatch": null
};
