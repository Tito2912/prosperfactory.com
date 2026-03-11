'use client';

import { useEffect, useMemo, useState } from 'react';
import { legalHref, localeFromPathname } from '@/lib/i18n';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: any[]) => void;
    __pfGaLoaded?: boolean;
  }
}

const STORAGE_KEY = 'pf-cookie-consent-v1';
const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? 'G-7D01N8RL7V';

function hasConsent(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'accepted';
  } catch {
    return false;
  }
}

function loadGaOnce() {
  if (window.__pfGaLoaded) return;
  window.__pfGaLoaded = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  } as any;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
  script.addEventListener('load', () => {
    window.gtag?.('js', new Date());
    window.gtag?.('config', MEASUREMENT_ID, { anonymize_ip: true });
  });

  document.head.appendChild(script);
}

export function AnalyticsClient() {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);

  const privacyHref = useMemo(() => legalHref(locale, 'privacy'), [locale]);

  const [accepted, setAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    const ok = hasConsent();
    setAccepted(ok);
    if (ok) loadGaOnce();
  }, []);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      // Consent gate: never queue or send analytics events before consent.
      if (!hasConsent()) return;

      const target = event.target as HTMLElement | null;
      const link = target?.closest?.('a') as HTMLAnchorElement | null;
      if (!link) return;

      const affiliate = String(link.getAttribute('data-affiliate') || '').trim();
      const placement = String(link.getAttribute('data-placement') || '').trim() || 'link';
      const label = String(link.textContent || '').trim().slice(0, 160);
      const linkUrl = String(link.getAttribute('href') || '').trim();

      if (affiliate) {
        try {
          window.gtag?.('event', 'affiliate_click', {
            affiliate,
            placement,
            label,
            link_url: linkUrl,
            page_path: window.location.pathname,
          });
        } catch {
          // ignore
        }
        return;
      }

      if (placement && placement !== 'link') {
        try {
          window.gtag?.('event', 'ui_click', {
            placement,
            label,
            link_url: linkUrl,
            page_path: window.location.pathname,
          });
        } catch {
          // ignore
        }
      }
    }

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const copy = {
    en: {
      textPrefix: 'Prosper Factory uses cookies to measure traffic and improve your experience. See our',
      privacy: 'privacy policy',
      textSuffix: 'for details.',
      button: 'Accept analytics',
    },
    fr: {
      textPrefix: "Prosper Factory utilise des cookies pour mesurer l'audience et améliorer votre expérience. Consultez notre",
      privacy: 'politique de confidentialité',
      textSuffix: 'pour plus de détails.',
      button: 'Accepter',
    },
    es: {
      textPrefix: 'Prosper Factory utiliza cookies para medir el tráfico y mejorar tu experiencia. Consulta nuestra',
      privacy: 'política de confidencialidad',
      textSuffix: 'para más detalles.',
      button: 'Aceptar',
    },
    de: {
      textPrefix: 'Prosper Factory verwendet Cookies, um Traffic zu messen und dein Erlebnis zu verbessern. Siehe',
      privacy: 'Datenschutzerklärung',
      textSuffix: 'für Details.',
      button: 'Akzeptieren',
    },
  } as const;

  function accept() {
    try {
      window.localStorage.setItem(STORAGE_KEY, 'accepted');
    } catch {
      // ignore
    }
    setAccepted(true);
    loadGaOnce();
  }

  // Avoid layout shift: render nothing until mounted.
  if (accepted === null) return null;

  if (accepted) return null;

  return (
    <div aria-label="Cookie consent" className="pf-cookie-banner" role="region">
      <span>
        {copy[locale].textPrefix}{' '}
        <a href={privacyHref}>{copy[locale].privacy}</a> {copy[locale].textSuffix}
      </span>
      <div className="pf-cookie-banner__actions">
        <button type="button" onClick={accept}>
          {copy[locale].button}
        </button>
      </div>
    </div>
  );
}
