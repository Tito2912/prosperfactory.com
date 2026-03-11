'use client';

import { usePathname } from 'next/navigation';
import { legalHref, localeFromPathname, pageHref, trustHref } from '@/lib/i18n';

export function SiteFooter() {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);

  const labels = {
    en: { about: 'About', contact: 'Contact', legal: 'Legal notice', privacy: 'Privacy policy', disclaimer: 'Disclaimer', affiliate: 'Affiliate disclosure' },
    fr: { about: 'À propos', contact: 'Contact', legal: 'Mentions légales', privacy: 'Politique de confidentialité', disclaimer: 'Avertissement', affiliate: 'Affiliation' },
    es: { about: 'Sobre', contact: 'Contacto', legal: 'Aviso legal', privacy: 'Política de confidencialidad', disclaimer: 'Descargo de responsabilidad', affiliate: 'Afiliación' },
    de: { about: 'Über uns', contact: 'Kontakt', legal: 'Impressum', privacy: 'Datenschutzerklärung', disclaimer: 'Haftungsausschluss', affiliate: 'Affiliate' },
  } as const;

  return (
    <footer className="footer">
      <div className="footer-inner">
        © {new Date().getFullYear()} — Prosper Factory •{' '}
        <a href={trustHref(locale, 'about')}>{labels[locale].about}</a> •{' '}
        <a href={trustHref(locale, 'contact')}>{labels[locale].contact}</a> •{' '}
        <a href={legalHref(locale, 'legal')}>{labels[locale].legal}</a> •{' '}
        <a href={legalHref(locale, 'privacy')}>{labels[locale].privacy}</a> •{' '}
        <a href={pageHref(locale, 'disclaimer')}>{labels[locale].disclaimer}</a> •{' '}
        <a href={pageHref(locale, 'affiliate-disclosure')}>{labels[locale].affiliate}</a>
      </div>
    </footer>
  );
}
