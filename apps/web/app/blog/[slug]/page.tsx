import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostBySlug, getPostSlugs, getRelatedPosts } from '@/lib/blog';
import { BlogArticle } from '@/components/blog/BlogArticle';
import { SITE_NAME, SITE_URL } from '@/lib/site';

// Only the known slugs are built; anything else 404s (no on-demand rendering).
export const dynamicParams = false;

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const path = `/blog/${post.slug}`;
  const title = `${post.title} · ${SITE_NAME}`;

  return {
    title: { absolute: title },
    description: post.description,
    alternates: { canonical: path },
    // Give search engines full snippet/preview latitude for long-form content.
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    openGraph: {
      type: 'article',
      url: path,
      title,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      section: post.category,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: post.description,
    },
  };
}

/** Strip the light Markdown emphasis authors use, for clean JSON-LD text. */
function toPlainText(markdown: string): string {
  return markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links -> text
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const url = `${SITE_URL}/blog/${post.slug}`;

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    url,
    mainEntityOfPage: url,
    articleSection: post.category,
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  };

  const faqLd =
    post.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: post.faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: toPlainText(f.a) },
          })),
        }
      : null;

  const related = getRelatedPosts(post.slug).map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      {faqLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      ) : null}
      <BlogArticle
        title={post.title}
        description={post.description}
        category={post.category}
        date={post.date}
        updated={post.updated}
        readingMinutes={post.readingMinutes}
        bodyHtml={post.bodyHtml}
        tool={{ name: post.tool.name, href: post.tool.href }}
        related={related}
      />
    </>
  );
}
