import type { InitialOptions } from '@jest/types/build/Config';

const config: InitialOptions = {
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  setupFilesAfterEnv: ['../jest.setup.ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  // collectCoverage: true,
  // coverageReporters: ['html', 'text'],
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};

export default config;
