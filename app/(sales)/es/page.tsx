import type { Metadata } from 'next';
import { getLegacySalesHomeHtml } from '@/lib/legacy-sales';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Las 7 leyes de los ultra-ricos';
  const description =
    'Activa ingresos exponenciales con las 7 leyes de los ultra-ricos: manual estratégico PDF, acceso inmediato y plan de acción de 35 minutos con bonos.';

  return {
    title,
    description,
    alternates: {
      canonical: '/es/',
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
      url: 'https://prosperfactory.com/es/',
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

export default async function HomeSalesEs() {
  const html = await getLegacySalesHomeHtml('es');

  const product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Las 7 leyes de los ultra-ricos — Manual Estratégico',
    description:
      'Activa ingresos exponenciales con las 7 leyes de los ultra-ricos: manual estratégico PDF, acceso inmediato y plan de acción de 35 minutos con bonos.',
    image: 'https://prosperfactory.com/assets/68c462e07fdf4_miniatureebook1.png',
    sku: 'PF-7LAWS-ES',
    brand: {
      '@type': 'Brand',
      name: 'Prosper Factory',
      url: 'https://prosperfactory.com/',
      logo: 'https://prosperfactory.com/assets/prosper-factory-logo.png',
    },
    offers: {
      '@type': 'Offer',
      url: 'https://prosperfactory.com/es/pago',
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
        name: '¿Para quién es ideal este manual?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Este Manual Estratégico™ está diseñado para emprendedores, inversores, freelancers y cualquiera listo para multiplicar sus ingresos con estrategias financieras inteligentes.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Qué recibiré exactamente?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Recibirás un Manual Estratégico™ completo que revela las 7 leyes financieras esenciales junto con un método estructurado para aplicarlas.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Existe una garantía de satisfacción?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sí. Cada compra incluye una garantía de satisfacción de 30 días para que pruebes el método sin riesgo.',
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
