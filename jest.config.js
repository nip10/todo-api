module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  // maxWorkers: 1,
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: ['**/src/tests/**.test.(ts|js)'],
  collectCoverageFrom: ['src/**/*.ts', '!node_modules'],
};