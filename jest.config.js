module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
    '@setup/(.*)': '<rootDir>/tests/setup/$1',
  },
  clearMocks: true,
}
