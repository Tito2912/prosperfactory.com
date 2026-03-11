import type { Metadata } from 'next';
import { getLegacySalesHomeHtml } from '@/lib/legacy-sales';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Die 7 Gesetze der Superreichen';
  const description =
    'Entfessele neue Einnahmen mit den 7 Gesetzen der Superreichen: strategisches Handbuch als PDF, sofortiger Zugriff und umsetzbarer 35-Minuten-Plan.';

  return {
    title,
    description,
    alternates: {
      canonical: '/de/',
      languages: {
        en: '/',
        fr: '/fr/',
        es: '/es/',
        de: '/de/',
        'x-default': '/',
      },
    },
    openGraph: {
      type: 'website',
      title,
      description,
      url: 'https://prosperfactory.com/de/',
      images: ['https://prosperfactory.com/assets/68c462e07fdf4_miniatureebook1.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://prosperfactory.com/assets/68c462e07fdf4_miniatureebook1.png'],
    },
  };
}

export default async function HomeSalesDe() {
  const html = await getLegacySalesHomeHtml('de');

  const product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Die 7 Gesetze der Superreichen — Strategisches Handbuch',
    description:
      'Entfessele neue Einnahmen mit den 7 Gesetzen der Superreichen: strategisches Handbuch als PDF, sofortiger Zugriff und umsetzbarer 35-Minuten-Plan.',
    image: 'https://prosperfactory.com/assets/68c462e07fdf4_miniatureebook1.png',
    sku: 'PF-7LAWS-DE',
    brand: {
      '@type': 'Brand',
      name: 'Prosper Factory',
      url: 'https://prosperfactory.com/',
      logo: 'https://prosperfactory.com/assets/prosper-factory-logo.png',
    },
    offers: {
      '@type': 'Offer',
      url: 'https://prosperfactory.com/de/zahlung',
      priceCurrency: 'EUR',
      price: '37.00',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      priceValidUntil: '2026-12-31',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: 4.9,
      reviewCount: 187,
      bestRating: 5,
      worstRating: 1,
    },
  };

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Für wen ist dieses Handbuch ideal?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Dieses Strategische Handbuch™ richtet sich an Unternehmer, Investoren, Freelancer und alle, die ihre Einnahmen mit smarteren Finanzstrategien vervielfachen möchten.',
        },
      },
      {
        '@type': 'Question',
        name: 'Was erhalte ich genau?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Du erhältst ein vollständiges Strategisches Handbuch™, das die 7 wichtigsten Finanzgesetze erklärt, plus eine strukturierte Methode, um diese Prinzipien anzuwenden.',
        },
      },
      {
        '@type': 'Question',
        name: 'Gibt es eine Zufriedenheitsgarantie?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ja. Jeder Kauf enthält eine 30-Tage-Zufriedenheits-oder-Geld-zurück-Garantie, damit du die Methode ohne Risiko testen kannst.',
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(product) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
