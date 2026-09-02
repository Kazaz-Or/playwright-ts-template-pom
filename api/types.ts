export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  imageUrl?: string;
}

export interface SearchResult {
  slug: string;
  title: string;
  description: string;
  tags: string[];
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  ok: boolean;
}
