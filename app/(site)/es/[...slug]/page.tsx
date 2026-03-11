import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleLayout } from '@/components/ArticleLayout';
import { getAllSlugs, getPostBySlug } from '@/lib/content';
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from '@/lib/schema';
import { buildAlternatesForSlugPath, OG_IMAGE } from '@/lib/seo';

export async function generateStaticParams() {
  const slugs = await getAllSlugs('es');
  return slugs.map((slugPath) => ({ slug: slugPath.split('/') }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug('es', slug);
  if (!post) return {};

  const canonical = post.canonical ?? `/es/${post.slug}/`;
  const alternates = await buildAlternatesForSlugPath({ locale: 'es', slugPath: post.slug, canonical });

  return {
    title: post.title,
    description: post.description,
    alternates,
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url: canonical,
      images: [{ url: OG_IMAGE }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [OG_IMAGE],
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const post = await getPostBySlug('es', slug);
  if (!post) return notFound();

  const articleJsonLd = buildArticleJsonLd(post);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(post);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {post.faq?.length ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: post.faq.map((x) => ({
              '@type': 'Question',
              name: x.q,
              acceptedAnswer: { '@type': 'Answer', text: x.a },
            })),
          }) }}
        />
      ) : null}

      <ArticleLayout post={post} locale="es" />
    </>
  );
}
