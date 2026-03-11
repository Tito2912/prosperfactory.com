import Link from 'next/link';
import { inferAffiliateIdFromHref, isExternalHref } from '@/lib/affiliates';

export function CTABox({
  title,
  body,
  buttonLabel,
  buttonHref,
}: {
  title: string;
  body: string;
  buttonLabel: string;
  buttonHref: string;
}) {
  const isExternal = isExternalHref(buttonHref);
  const affiliateId = isExternal ? inferAffiliateIdFromHref(buttonHref) : undefined;

  return (
    <section className="cta" aria-label="Call to action">
      <strong>{title}</strong>
      <p className="muted" style={{ margin: '6px 0 12px' }}>{body}</p>
      {isExternal ? (
        <a
          className="kbd"
          href={buttonHref}
          data-affiliate={affiliateId}
          data-placement="cta"
          rel="nofollow sponsored noopener noreferrer"
          target="_blank"
        >
          {buttonLabel}
        </a>
      ) : (
        <Link className="kbd" href={buttonHref} data-placement="cta">
          {buttonLabel}
        </Link>
      )}
    </section>
  );
}
