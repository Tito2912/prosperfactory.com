export const SUPPORTED_LOCALES = ['en', 'fr', 'es', 'de'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

export function localeFromPathname(pathname: string | null | undefined): SupportedLocale {
  const first = (pathname ?? '/').split('/').filter(Boolean)[0];
  if (first === 'fr' || first === 'es' || first === 'de') return first;
  return 'en';
}

export function prefixForLocale(locale: SupportedLocale): string {
  return locale === 'en' ? '' : `/${locale}`;
}

export const LEGAL_SLUGS: Record<SupportedLocale, { legal: string; privacy: string }> = {
  en: { legal: 'legal-notice', privacy: 'privacy-policy' },
  fr: { legal: 'mentions-legales', privacy: 'politique-de-confidentialite' },
  es: { legal: 'mentions-legales', privacy: 'politica-de-confidencialidad' },
  de: { legal: 'mentions-legales', privacy: 'datenschutzerklaerung' },
};

export const TRUST_SLUGS: Record<SupportedLocale, { about: string; contact: string; methodology: string; sources: string }> = {
  en: { about: 'about', contact: 'contact', methodology: 'methodology', sources: 'sources' },
  fr: { about: 'a-propos', contact: 'contact', methodology: 'methodologie', sources: 'sources' },
  es: { about: 'sobre', contact: 'contacto', methodology: 'metodologia', sources: 'fuentes' },
  de: { about: 'uber-uns', contact: 'kontakt', methodology: 'methodik', sources: 'quellen' },
};

export function pageHref(locale: SupportedLocale, slugPath: string): string {
  const prefix = prefixForLocale(locale);
  const slug = slugPath.replace(/^\/+/, '').replace(/\/+$/, '');
  if (!slug) return `${prefix || '/'}`;
  return `${prefix}/${slug}/`;
}

export function legalHref(locale: SupportedLocale, key: 'legal' | 'privacy'): string {
  return pageHref(locale, LEGAL_SLUGS[locale][key]);
}

export type TrustKey = keyof (typeof TRUST_SLUGS)['en'];

export function trustHref(locale: SupportedLocale, key: TrustKey): string {
  return pageHref(locale, TRUST_SLUGS[locale][key]);
}

export function intlLocale(locale: SupportedLocale): string {
  switch (locale) {
    case 'fr':
      return 'fr-FR';
    case 'es':
      return 'es-ES';
    case 'de':
      return 'de-DE';
    default:
      return 'en-US';
  }
}
