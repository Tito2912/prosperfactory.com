import type { Metadata } from 'next';
import { getLegacySalesHomeHtml } from '@/lib/legacy-sales';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Les 7 lois des ultra-riches : guide PDF';
  const description =
    "Boostez vos revenus avec les 7 lois des ultra-riches : manuel stratégique PDF, accès immédiat, plan d'action de 35 minutes et bonus exclusifs.";

  return {
    title,
    description,
    alternates: {
      canonical: '/fr/',
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
      url: 'https://prosperfactory.com/fr/',
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

export default async function HomeSalesFr() {
  const html = await getLegacySalesHomeHtml('fr');

  const product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Les 7 lois des ultra-riches — Manuel Stratégique',
    description:
      "Boostez vos revenus avec les 7 lois des ultra-riches : manuel stratégique PDF, accès immédiat, plan d'action de 35 minutes et bonus exclusifs.",
    image: 'https://prosperfactory.com/assets/68c462e07fdf4_miniatureebook1.png',
    sku: 'PF-7LAWS-FR',
    brand: {
      '@type': 'Brand',
      name: 'Prosper Factory',
      url: 'https://prosperfactory.com/',
      logo: 'https://prosperfactory.com/assets/prosper-factory-logo.png',
    },
    offers: {
      '@type': 'Offer',
      url: 'https://prosperfactory.com/fr/paiement',
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
        name: "À qui s'adresse ce manuel ?",
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Ce Manuel Stratégique™ s'adresse aux entrepreneurs, investisseurs, freelances et à toute personne qui veut multiplier ses revenus avec des stratégies financières plus intelligentes.",
        },
      },
      {
        '@type': 'Question',
        name: 'Que vais-je recevoir exactement ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Vous recevez un Manuel Stratégique™ complet qui révèle les 7 lois financières essentielles ainsi qu'une méthode structurée pour appliquer ces principes cachés.",
        },
      },
      {
        '@type': 'Question',
        name: 'Y a-t-il une garantie de satisfaction ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Oui. Chaque achat inclut une garantie Satisfaction ou Remboursé de 30 jours afin de tester la méthode sans risque.',
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
