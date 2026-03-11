import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { compileMDX } from 'next-mdx-remote/rsc';
import type { Post, PostType } from '@/lib/types';
import type { TocHeading } from '@/components/TableOfContents';
import { slugifyHeading } from '@/lib/slug';
import { mdxComponents } from '@/lib/mdx-components';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export const LOCALES = ['en', 'fr', 'es', 'de'] as const;
export type Locale = typeof LOCALES[number];

type Frontmatter = {
  title: string;
  description: string;
  date?: string;
  updatedAt?: string;
  canonical?: string;
  type: PostType;
  primaryKeyword?: string;
  jumpLinks?: { href: string; label: string }[];
  quickAnswer?: string[];
  cta?: { title: string; body: string; buttonLabel: string; buttonHref: string };
  internalLinks?: { href: string; anchor: string }[];
  faq?: { q: string; a: string }[];
};

function extractHeadingsFromMdxSource(source: string): TocHeading[] {
  const lines = source.split(/\r?\n/);
  const headings: TocHeading[] = [];

  for (const line of lines) {
    const m = /^(#{2,4})\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const level = m[1].length;
    const text = m[2].replace(/`/g, '').trim();
    const id = slugifyHeading(text);
    headings.push({ id, text, level });
  }

  return headings;
}

async function collectMdxSlugPaths(dir: string, prefix: string): Promise<string[]> {
  let entries: Array<import('node:fs').Dirent>;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const slugs: string[] = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      slugs.push(...await collectMdxSlugPaths(path.join(dir, entry.name), path.posix.join(prefix, entry.name)));
      continue;
    }
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.mdx')) continue;
    const base = entry.name.replace(/\.mdx$/, '');
    slugs.push(path.posix.join(prefix, base));
  }

  return slugs;
}

export async function getAllSlugs(locale: Locale): Promise<string[]> {
  const localeDir = path.join(CONTENT_DIR, locale);
  const slugs = await collectMdxSlugPaths(localeDir, '');
  return slugs.sort();
}

export async function getAllPosts(locale: Locale): Promise<Array<Pick<Post, 'slug' | 'title' | 'description' | 'updatedAt' | 'date'>>> {
  const slugs = await getAllSlugs(locale);
  const posts = await Promise.all(slugs.map(async (slug) => {
    const raw = await fs.readFile(path.join(CONTENT_DIR, locale, `${slug}.mdx`), 'utf8');
    const { data } = matter(raw);
    const fm = data as Frontmatter;
    return {
      slug,
      title: fm.title,
      description: fm.description,
      date: fm.date,
      updatedAt: fm.updatedAt,
    };
  }));

  return posts;
}

function buildCanonicalPath(locale: Locale, slugPath: string): string {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  return `${prefix}/${slugPath}/`;
}

export async function getPostBySlug(locale: Locale, slugParts: string[]): Promise<Post | null> {
  const slugPath = slugParts.join('/');
  const filePath = path.join(CONTENT_DIR, locale, `${slugPath}.mdx`);

  let raw: string;
  try {
    raw = await fs.readFile(filePath, 'utf8');
  } catch {
    return null;
  }

  const headings = extractHeadingsFromMdxSource(raw);
  const { content: mdxSource, data } = matter(raw);
  const frontmatter = data as Frontmatter;

  // Build-time compilation of trusted local MDX.
  const compiled = await compileMDX({
    source: mdxSource,
    components: mdxComponents,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        // Security: block JS in MDX compilation
        // (next-mdx-remote v6 defaults are safe; we keep it explicit)
        // @ts-expect-error - options are passed through
        blockDangerousJS: true,
        blockJS: true,
      },
    },
  });

  return {
    slug: slugPath,
    title: frontmatter.title,
    description: frontmatter.description,
    date: frontmatter.date,
    updatedAt: frontmatter.updatedAt,
    canonical: frontmatter.canonical ?? buildCanonicalPath(locale, slugPath),
    type: frontmatter.type,
    primaryKeyword: frontmatter.primaryKeyword,
    jumpLinks: frontmatter.jumpLinks,
    quickAnswer: frontmatter.quickAnswer,
    cta: frontmatter.cta,
    internalLinks: frontmatter.internalLinks,
    faq: frontmatter.faq,
    headings,
    content: compiled.content,
  };
}
