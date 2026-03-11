import type { Metadata } from 'next';
import { getLegacySalesHomeHtml } from '@/lib/legacy-sales';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'The 7 Laws of the Ultra-Rich PDF';
  const description =
    'Unlock faster income growth with the 7 laws of the ultra-rich: Strategic Playbook™ PDF, instant access, 35-minute action plan and exclusive bonuses.';

  return {
    title,
    description,
    alternates: {
      canonical: '/',
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
      url: 'https://prosperfactory.com/',
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

export default async function HomeSalesEn() {
  const html = await getLegacySalesHomeHtml('en');

  const product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'The 7 Laws of the Ultra-Rich — Strategic Playbook',
    description:
      'Unlock faster income growth with the 7 laws of the ultra-rich: Strategic Playbook™ PDF, instant access, 35-minute action plan and exclusive bonuses.',
    image: 'https://prosperfactory.com/assets/68c462e07fdf4_miniatureebook1.png',
    sku: 'PF-7LAWS-EN',
    brand: {
      '@type': 'Brand',
      name: 'Prosper Factory',
      url: 'https://prosperfactory.com/',
      logo: 'https://prosperfactory.com/assets/prosper-factory-logo.png',
    },
    offers: {
      '@type': 'Offer',
      url: 'https://prosperfactory.com/payment',
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
        name: 'Who is this ideal for?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'This Strategic Manual™ is designed for entrepreneurs, investors, freelancers, and anyone ready to multiply their income with smarter wealth strategies.',
        },
      },
      {
        '@type': 'Question',
        name: 'What exactly will I receive?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You will receive a complete Strategic Manual™ that reveals the 7 essential financial laws along with a structured method to apply these hidden principles.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is there a satisfaction guarantee?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Every purchase includes a 30-day Satisfaction or Refund guarantee so you can test the method without risk.',
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
