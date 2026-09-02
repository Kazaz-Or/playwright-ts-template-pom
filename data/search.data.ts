import { SearchTestData } from './types';

export const searchTestData: SearchTestData[] = [
  {
    query: 'playwright',
    expectedResultsMinCount: 1,
    shouldHaveResults: true,
  },
  {
    query: 'python',
    expectedResultsMinCount: 1,
    shouldHaveResults: true,
  },
  {
    query: 'typescript',
    expectedResultsMinCount: 1,
    shouldHaveResults: true,
  },
  {
    query: 'xyznotexistingquery123',
    shouldHaveResults: false,
  },
];

export const searchQueries = {
  validQuery: 'playwright',
  emptyQuery: '',
  specialCharsQuery: '!@#$%',
  noResultsQuery: 'xyznotexistingquery123',
} as const;
