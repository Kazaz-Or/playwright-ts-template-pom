import axios, { AxiosInstance } from 'axios';
import { ApiResponse, BlogPost } from './types';
import { EnvConfig } from '../config/env.config';

/**
 * API helper for interacting with the blog's data endpoints.
 * Uses axios for HTTP requests independent of Playwright browser context.
 */
export class BlogApi {
  private readonly client: AxiosInstance;

  constructor(baseURL?: string) {
    this.client = axios.create({
      baseURL: baseURL ?? EnvConfig.baseUrl,
      timeout: 15_000,
      validateStatus: () => true,
    });
  }

  async getSearchIndex(): Promise<ApiResponse<BlogPost[]>> {
    const response = await this.client.get('/content/search/index.json');
    return {
      data: response.data,
      status: response.status,
      ok: response.status >= 200 && response.status < 300,
    };
  }

  async checkPageExists(path: string): Promise<boolean> {
    const response = await this.client.get(path);
    return response.status >= 200 && response.status < 300;
  }

  async getPageStatus(path: string): Promise<number> {
    const response = await this.client.get(path);
    return response.status;
  }

  async getSitemapXml(): Promise<ApiResponse<string>> {
    const response = await this.client.get('/sitemap.xml');
    return {
      data: response.data,
      status: response.status,
      ok: response.status >= 200 && response.status < 300,
    };
  }

  async getRssFeed(): Promise<ApiResponse<string>> {
    const response = await this.client.get('/rss.xml');
    return {
      data: response.data,
      status: response.status,
      ok: response.status >= 200 && response.status < 300,
    };
  }

  async getResponseHeaders(path: string): Promise<Record<string, string>> {
    const response = await this.client.head(path);
    return response.headers as Record<string, string>;
  }
}
