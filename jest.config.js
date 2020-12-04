module.exports = {
    roots: [
        "<rootDir>/test"
    ],
    testRegex: 'test/(.+)\\.(test|spec)\\.(jsx?|tsx?)$',
    transform: {
        "^.+\\.tsx?$": "ts-jest"
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
