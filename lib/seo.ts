import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import type { Metadata } from 'next';
import { LOCALES, type Locale } from '@/lib/content';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export const OG_IMAGE = '/assets/og-image-1200x630.png';

type TranslationIndex = Map<string, Partial<Record<Locale, string>>>;
let translationIndexPromise: Promise<TranslationIndex> | null = null;

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.stat(filePath);
    return true;
  } catch {
    return false;
  }
}

function buildDefaultCanonical(locale: Locale, slugPath: string): string {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  return `${prefix}/${slugPath}/`;
}

type MdxFrontmatter = { canonical?: string; translationKey?: string };

async function readFrontmatterFromMdx(filePath: string): Promise<MdxFrontmatter | null> {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const { data } = matter(raw);
    const fm = data as any;
    return {
      canonical: typeof fm?.canonical === 'string' && fm.canonical.trim() ? fm.canonical.trim() : undefined,
      translationKey:
        typeof fm?.translationKey === 'string' && fm.translationKey.trim() ? fm.translationKey.trim() : undefined,
    };
  } catch {
    return null;
  }
}

async function getTranslationIndex(): Promise<TranslationIndex> {
  if (!translationIndexPromise) translationIndexPromise = buildTranslationIndex();
  return translationIndexPromise;
}

function upsertIndex(index: TranslationIndex, key: string, locale: Locale, href: string) {
  const existing = index.get(key) ?? {};
  if (existing[locale]) return;
  existing[locale] = href;
  index.set(key, existing);
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

async function buildTranslationIndex(): Promise<TranslationIndex> {
  const index: TranslationIndex = new Map();

  for (const locale of LOCALES) {
    const localeDir = path.join(CONTENT_DIR, locale);
    const slugs = await collectMdxSlugPaths(localeDir, '');
    for (const slugPath of slugs) {
      const filePath = path.join(localeDir, `${slugPath}.mdx`);
      const fm = await readFrontmatterFromMdx(filePath);
      if (!fm?.translationKey) continue;
      upsertIndex(index, fm.translationKey, locale, fm.canonical ?? buildDefaultCanonical(locale, slugPath));
    }
  }

  return index;
}

export async function buildAlternatesForSlugPath({
  locale,
  slugPath,
  canonical,
}: {
  locale: Locale;
  slugPath: string;
  canonical: string;
}): Promise<Metadata['alternates']> {
  const currentFilePath = path.join(CONTENT_DIR, locale, `${slugPath}.mdx`);
  const currentFm = await readFrontmatterFromMdx(currentFilePath);
  if (currentFm?.translationKey) {
    const index = await getTranslationIndex();
    const entry = index.get(currentFm.translationKey);
    if (entry && Object.keys(entry).length) {
      return {
        canonical,
        languages: entry as Record<string, string>,
      };
    }
  }

  const languages: Record<string, string> = {};

  for (const l of LOCALES) {
    const filePath = path.join(CONTENT_DIR, l, `${slugPath}.mdx`);
    if (!(await exists(filePath))) continue;
    const fm = await readFrontmatterFromMdx(filePath);
    languages[l] = fm?.canonical ?? buildDefaultCanonical(l, slugPath);
  }

  return {
    canonical,
    languages: Object.keys(languages).length ? languages : undefined,
  };
}
