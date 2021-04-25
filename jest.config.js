module.exports = {
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: ['**/src/tests/**.test.(ts|js)'],
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.ts', '!node_modules'],
};
