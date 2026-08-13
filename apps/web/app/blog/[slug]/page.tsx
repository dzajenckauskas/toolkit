import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostBySlug, getPostSlugs, getRelatedPosts } from '@/lib/blog';
import { BlogArticle } from '@/components/blog/BlogArticle';
import { AUTHOR_NAME, AUTHOR_URL, SITE_NAME, SITE_URL } from '@/lib/site';

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
  const image = {
    url: post.cover.src,
    width: post.cover.width,
    height: post.cover.height,
    alt: post.cover.alt,
  };

  return {
    title: { absolute: title },
    description: post.description,
    ...(post.keywords.length ? { keywords: post.keywords } : {}),
    authors: [{ name: AUTHOR_NAME, url: AUTHOR_URL }],
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
      tags: post.keywords,
      authors: [AUTHOR_URL],
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: post.description,
      images: [post.cover.src],
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
    image: [`${SITE_URL}${post.cover.src}`],
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    url,
    mainEntityOfPage: url,
    articleSection: post.category,
    wordCount: post.wordCount,
    inLanguage: 'en',
    ...(post.keywords.length ? { keywords: post.keywords.join(', ') } : {}),
    author: { '@type': 'Person', name: AUTHOR_NAME, url: AUTHOR_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
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
        cover={post.cover}
        tool={{ name: post.tool.name, href: post.tool.href }}
        related={related}
      />
    </>
  );
}
