import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import type { Metadata } from 'next';
import { LOCALES, type Locale } from '@/lib/content';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export const OG_IMAGE = '/assets/og-image-1200x630.png';

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

async function readCanonicalFromMdx(locale: Locale, slugPath: string): Promise<string> {
  const filePath = path.join(CONTENT_DIR, locale, `${slugPath}.mdx`);
  const raw = await fs.readFile(filePath, 'utf8');
  const { data } = matter(raw);
  const canonical = (data as any)?.canonical;
  if (typeof canonical === 'string' && canonical.trim()) return canonical.trim();
  return buildDefaultCanonical(locale, slugPath);
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
  const languages: Record<string, string> = {};

  for (const l of LOCALES) {
    const filePath = path.join(CONTENT_DIR, l, `${slugPath}.mdx`);
    if (!(await exists(filePath))) continue;
    try {
      languages[l] = await readCanonicalFromMdx(l, slugPath);
    } catch {
      languages[l] = buildDefaultCanonical(l, slugPath);
    }
  }

  return {
    canonical,
    languages: Object.keys(languages).length ? languages : undefined,
  };
}

