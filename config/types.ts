export interface EnvConfigType {
  readonly baseUrl: string;
  readonly isCI: boolean;
  readonly slowMo: number;
  readonly retries: number;
  readonly workers: number | undefined;
}
