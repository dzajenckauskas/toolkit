import { pageMetadata } from '@/lib/seo';
import { getAllPosts } from '@/lib/blog';
import { BlogIndex } from '@/components/blog/BlogIndex';

export const metadata = pageMetadata({
  title: 'Blog – Privacy, Developer & Design Guides',
  description:
    'Practical guides on privacy, developer tooling and design — from Toolkit, a hub of free online tools that run entirely in your browser. No account or upload.',
  path: '/blog',
});

export default function BlogIndexPage() {
  const posts = getAllPosts().map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    category: p.category,
    date: p.date,
    readingMinutes: p.readingMinutes,
    cover: p.cover,
  }));

  return <BlogIndex posts={posts} />;
}
