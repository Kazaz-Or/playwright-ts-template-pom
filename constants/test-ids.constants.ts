/**
 * Data-testid selectors for the kazis.dev site.
 * These map to elements on the site — update if the site structure changes.
 */
export const TestIds = {
  // Navbar
  NavBar: 'navbar',
  NavHome: 'nav-home',
  NavBlogs: 'nav-blogs',
  NavAbout: 'nav-about',
  NavTags: 'nav-tags',
  NavSearchIcon: 'nav-search-icon',
  NavThemeToggle: 'nav-theme-toggle',

  // Search
  SearchInput: 'search-input',
  SearchResults: 'search-results',
  SearchResultItem: 'search-result-item',
  SearchNoResults: 'search-no-results',

  // Blog List
  BlogCard: 'blog-card',
  BlogCardTitle: 'blog-card-title',
  BlogCardTags: 'blog-card-tags',
  BlogCardDate: 'blog-card-date',
  BlogCardReadMore: 'blog-card-read-more',

  // Blog Post
  BlogPostTitle: 'blog-post-title',
  BlogPostContent: 'blog-post-content',
  BlogPostDate: 'blog-post-date',
  BlogPostTags: 'blog-post-tags',
  BlogPostCodeBlock: 'blog-post-code-block',
  BlogPostCopyButton: 'blog-post-copy-button',
  RelatedBlogs: 'related-blogs',

  // Home
  HeroSection: 'hero-section',
  LatestArticles: 'latest-articles',
  NewsletterCta: 'newsletter-cta',

  // Footer
  Footer: 'footer',
  FooterLinks: 'footer-links',
} as const;
