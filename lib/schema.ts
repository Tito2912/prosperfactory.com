import type { Post } from '@/lib/types';

const BASE_URL = 'https://prosperfactory.com';

export function buildArticleJsonLd(post: Post) {
  const url = new URL(post.canonical ?? `/${post.slug}`, BASE_URL).toString();
  const published = post.date ?? post.updatedAt ?? new Date().toISOString();
  const modified = post.updatedAt ?? published;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    mainEntityOfPage: url,
    datePublished: published,
    dateModified: modified,
    author: [{ '@type': 'Person', name: 'Tony Caron' }],
    publisher: { '@type': 'Organization', name: 'Prosper Factory' },
  };
}

export function buildBreadcrumbJsonLd(post: Post) {
  const url = new URL(post.canonical ?? `/${post.slug}`, BASE_URL).toString();
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: post.title,
        item: url,
      },
    ],
  };
}
