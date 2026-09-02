import { BlogApi } from '../api/blog.api';
import { AccessibilityHelper } from '../helpers/accessibility.helper';
import { AssertionsHelper } from '../helpers/assertions.helper';
import { NavigationHelper } from '../helpers/navigation.helper';
import { PageHelper } from '../helpers/page.helper';
import { PerformanceHelper } from '../helpers/performance.helper';
import { AboutPage } from '../pages/about.page';
import { BlogPostPage } from '../pages/blog-post.page';
import { BlogsPage } from '../pages/blogs.page';
import { HomePage } from '../pages/home.page';
import { TagPage } from '../pages/tag.page';
import { TagsPage } from '../pages/tags.page';

export interface TestFixtures {
  // Page Objects
  homePage: HomePage;
  blogsPage: BlogsPage;
  blogPostPage: BlogPostPage;
  aboutPage: AboutPage;
  tagsPage: TagsPage;
  tagPage: TagPage;

  // Helpers
  assertions: AssertionsHelper;
  navigation: NavigationHelper;
  pageHelper: PageHelper;
  performance: PerformanceHelper;
  a11y: AccessibilityHelper;

  // API
  blogApi: BlogApi;
}
