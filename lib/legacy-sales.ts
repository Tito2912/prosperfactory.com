import fs from 'node:fs/promises';
import path from 'node:path';
import type { SupportedLocale } from '@/lib/i18n';

const LEGACY_HOME_FILES: Record<SupportedLocale, string> = {
  en: 'index.html',
  fr: path.join('fr', 'index.html'),
  es: path.join('es', 'index.html'),
  de: path.join('de', 'index.html'),
};

function extractBody(html: string): string {
  const lower = html.toLowerCase();
  const bodyOpen = lower.indexOf('<body');
  if (bodyOpen === -1) return '';
  const bodyStart = lower.indexOf('>', bodyOpen);
  if (bodyStart === -1) return '';
  const bodyClose = lower.lastIndexOf('</body');
  if (bodyClose === -1 || bodyClose <= bodyStart) return '';
  return html.slice(bodyStart + 1, bodyClose);
}

function normalizeAssetUrls(html: string): string {
  // Make asset URLs absolute so they work under /fr, /es, /de paths.
  return html.replace(/(^|[\s"'(,])assets\//g, '$1/assets/');
}

function normalizeCheckoutLinks(html: string): string {
  // Prefer clean internal URLs for checkout.
  return html
    .replace(/href="\/payment\.html"/g, 'href="/payment"')
    .replace(/href="\/fr\/paiement\.html"/g, 'href="/fr/paiement"')
    .replace(/href="\/es\/pago\.html"/g, 'href="/es/pago"')
    .replace(/href="\/de\/zahlung\.html"/g, 'href="/de/zahlung"');
}

function normalizeTrustLinks(html: string): string {
  // Keep trailing slashes to avoid internal redirect hops on Netlify/static export.
  return html
    .replace(/href="\/legal-notice"/g, 'href="/legal-notice/"')
    .replace(/href="\/privacy-policy"/g, 'href="/privacy-policy/"')
    .replace(/href="\/disclaimer"/g, 'href="/disclaimer/"')
    .replace(/href="\/affiliate-disclosure"/g, 'href="/affiliate-disclosure/"')
    .replace(/href="\/fr\/mentions-legales"/g, 'href="/fr/mentions-legales/"')
    .replace(/href="\/fr\/politique-de-confidentialite"/g, 'href="/fr/politique-de-confidentialite/"')
    .replace(/href="\/fr\/disclaimer"/g, 'href="/fr/disclaimer/"')
    .replace(/href="\/fr\/affiliate-disclosure"/g, 'href="/fr/affiliate-disclosure/"')
    .replace(/href="\/es\/mentions-legales"/g, 'href="/es/mentions-legales/"')
    .replace(/href="\/es\/politica-de-confidencialidad"/g, 'href="/es/politica-de-confidencialidad/"')
    .replace(/href="\/es\/disclaimer"/g, 'href="/es/disclaimer/"')
    .replace(/href="\/es\/affiliate-disclosure"/g, 'href="/es/affiliate-disclosure/"')
    .replace(/href="\/de\/mentions-legales"/g, 'href="/de/mentions-legales/"')
    .replace(/href="\/de\/datenschutzerklaerung"/g, 'href="/de/datenschutzerklaerung/"')
    .replace(/href="\/de\/disclaimer"/g, 'href="/de/disclaimer/"')
    .replace(/href="\/de\/affiliate-disclosure"/g, 'href="/de/affiliate-disclosure/"');
}

async function loadLazySectionHtml(locale: SupportedLocale, id: string): Promise<string | null> {
  const filePath = path.join(process.cwd(), 'public', 'assets', 'pf-lazy', locale, `${id}.b64`);
  let raw: string;
  try {
    raw = await fs.readFile(filePath, 'utf8');
  } catch {
    return null;
  }

  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    return Buffer.from(trimmed, 'base64').toString('utf8');
  } catch {
    return null;
  }
}

async function inlineLazySections(bodyHtml: string, locale: SupportedLocale): Promise<string> {
  // Inline all deferred sections so content is always present (no JS dependency).
  const sectionRe =
    /<section\b([^>]*?)\bdata-pf-lazy-src=(["'])([^"']+)\2([^>]*)>([\s\S]*?)<\/section>/gi;

  let out = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = sectionRe.exec(bodyHtml)) !== null) {
    const [full, before, , id, after] = match;
    out += bodyHtml.slice(lastIndex, match.index);

    const lazyHtml = await loadLazySectionHtml(locale, id);
    if (!lazyHtml) {
      out += full;
      lastIndex = sectionRe.lastIndex;
      continue;
    }

    const normalized = normalizeTrustLinks(normalizeCheckoutLinks(normalizeAssetUrls(lazyHtml)));
    out += `<section${before}${after}>${normalized}</section>`;
    lastIndex = sectionRe.lastIndex;
  }

  out += bodyHtml.slice(lastIndex);
  return out;
}

function normalizeLegacyMarkup(bodyHtml: string, locale: SupportedLocale): string {
  let html = bodyHtml;

  // Remove legacy cookie banner (we render our own consent banner via AnalyticsClient).
  html = html.replace(
    /<div\b[^>]*id=["']pf-cookie-banner["'][^>]*>[\s\S]*?<\/div>\s*(?=<div\b[^>]*id=["']app["'])/i,
    '',
  );

  // Strip any inline scripts from the legacy file; we re-add required scripts via Next <Script/>.
  html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');

  html = normalizeTrustLinks(normalizeCheckoutLinks(normalizeAssetUrls(html)));

  return html;
}

export async function getLegacySalesHomeHtml(locale: SupportedLocale): Promise<string> {
  const rel = LEGACY_HOME_FILES[locale];
  const filePath = path.join(process.cwd(), rel);
  const raw = await fs.readFile(filePath, 'utf8');
  const body = extractBody(raw);
  const normalized = normalizeLegacyMarkup(body, locale);
  return inlineLazySections(normalized, locale);
}
