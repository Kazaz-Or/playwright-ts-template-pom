export interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  failures: { test: string; error: string; file: string }[];
}

export interface SlackPayload {
  blocks: any[];
}

export interface FailureAnalysis {
  testName: string;
  analysis: string;
  category: 'test' | 'app' | 'environment' | 'unknown';
}
