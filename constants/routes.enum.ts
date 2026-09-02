export enum Routes {
  Home = '/',
  Blogs = '/blogs',
  About = '/about',
  Tags = '/tags',
}

export const blogRoute = (slug: string): string => `/blogs/${slug}`;
export const tagRoute = (tag: string): string => `/tags/${tag}`;
