export type AffiliateId = 'tradingview' | 'bitpanda' | 'etoro';

export function inferAffiliateIdFromHref(href: string): AffiliateId | undefined {
  const x = href.toLowerCase();
  if (x.includes('tradingview')) return 'tradingview';
  if (x.includes('bitpanda')) return 'bitpanda';
  if (x.includes('etoro')) return 'etoro';
  return undefined;
}

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

