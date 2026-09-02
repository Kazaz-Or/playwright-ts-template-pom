export interface BlogTestData {
  slug: string;
  title: string;
  tags: string[];
  expectedHeadings?: string[];
  hasCodeBlocks?: boolean;
}

export interface SearchTestData {
  query: string;
  expectedResultsMinCount?: number;
  shouldHaveResults: boolean;
}

export interface NavigationTestData {
  label: string;
  expectedUrl: string;
  expectedTitle?: string;
}
