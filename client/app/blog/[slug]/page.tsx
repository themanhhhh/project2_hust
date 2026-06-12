import type { Metadata } from 'next';
import { BlogPostClient } from './BlogPostClient';
import { absoluteUrl, getPostForSeo, stripHtml, truncateDescription } from '@/lib/server-seo';

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostForSeo(slug);

  if (!post) {
    return {
      title: 'Không tìm thấy bài viết | SmashX',
      robots: { index: false, follow: false },
    };
  }

  const title = post.meta_title || post.title;
  const description = truncateDescription(
    stripHtml(post.meta_description || post.excerpt || post.content) || `${post.title} - bài viết tư vấn cầu lông từ SmashX.`
  );
  const url = absoluteUrl(`/blog/${post.slug}`);

  return {
    title: `${title} | SmashX Blog`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      authors: [post.author?.name || 'SmashX'],
      images: post.featured_image ? [{ url: post.featured_image, alt: post.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.featured_image ? [post.featured_image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostForSeo(slug);

  const articleJsonLd = post
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: truncateDescription(stripHtml(post.excerpt || post.content), 220),
        image: post.featured_image ? [post.featured_image] : undefined,
        datePublished: post.created_at,
        dateModified: post.updated_at || post.created_at,
        author: {
          '@type': 'Person',
          name: post.author?.name || 'SmashX',
        },
        publisher: {
          '@type': 'Organization',
          name: 'SmashX',
          url: absoluteUrl('/'),
        },
        mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
      }
    : null;
  const breadcrumbJsonLd = post
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Trang chủ',
            item: absoluteUrl('/'),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: absoluteUrl('/blog'),
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: post.title,
            item: absoluteUrl(`/blog/${post.slug}`),
          },
        ],
      }
    : null;

  return (
    <>
      {articleJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
      )}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      <BlogPostClient />
    </>
  );
}
