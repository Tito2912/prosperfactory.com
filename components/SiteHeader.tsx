'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { localeFromPathname, pageHref, prefixForLocale } from '@/lib/i18n';

export function SiteHeader() {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const prefix = prefixForLocale(locale);
  const homeHref = prefix ? `${prefix}/` : '/';
  const showSeoNav = true;
  const comparisonsSlug = locale === 'fr' ? 'comparatifs' : 'comparisons';
  const guidesLabel = locale === 'es' ? 'Guías' : locale === 'de' ? 'Leitfäden' : 'Guides';
  const comparisonsLabel = locale === 'fr' ? 'Comparatifs' : locale === 'es' ? 'Comparativas' : locale === 'de' ? 'Vergleiche' : 'Comparisons';
  const affiliateLabel = locale === 'fr' ? 'Affiliation' : locale === 'es' ? 'Afiliación' : locale === 'de' ? 'Affiliate' : 'Affiliate';

  return (
    <header className="header">
      <div className="header-inner">
        <Link className="brand" href={homeHref}>
          <img
            src="/assets/prosper-factory-logo.png"
            alt=""
            aria-hidden="true"
            width="150"
            height="30"
          />
          <span className="sr-only">Prosper Factory</span>
        </Link>
        <nav className="nav" aria-label="Primary">
          <Link href={pageHref(locale, 'tools/tradingview')}>TradingView</Link>
          <Link href={pageHref(locale, 'crypto/bitpanda')}>Bitpanda</Link>
          <Link href={pageHref(locale, 'brokers/etoro')}>eToro</Link>
          {showSeoNav ? <Link href={pageHref(locale, 'guides')}>{guidesLabel}</Link> : null}
          {showSeoNav ? (
            <Link href={pageHref(locale, comparisonsSlug)}>{comparisonsLabel}</Link>
          ) : null}
          <Link href={pageHref(locale, 'affiliate-disclosure')}>{affiliateLabel}</Link>
        </nav>
        <nav className="nav" aria-label="Languages">
          <Link aria-current={locale === 'en' ? 'page' : undefined} href="/">EN</Link>
          <Link aria-current={locale === 'fr' ? 'page' : undefined} href="/fr/">FR</Link>
          <Link aria-current={locale === 'es' ? 'page' : undefined} href="/es/">ES</Link>
          <Link aria-current={locale === 'de' ? 'page' : undefined} href="/de/">DE</Link>
        </nav>
      </div>
    </header>
  );
}
