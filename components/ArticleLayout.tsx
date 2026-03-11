import Link from 'next/link';
import { TableOfContents } from '@/components/TableOfContents';
import { FAQ } from '@/components/FAQ';
import { CTABox } from '@/components/CTABox';
import type { Post } from '@/lib/types';
import { intlLocale, type SupportedLocale } from '@/lib/i18n';

const copy = {
  en: { jumpTo: 'Jump to', quickAnswer: 'Quick answer', onThisPage: 'On this page', nextSteps: 'Next steps', updated: 'Updated' },
  fr: { jumpTo: 'Aller à', quickAnswer: 'Réponse rapide', onThisPage: 'Sur cette page', nextSteps: 'Pour aller plus loin', updated: 'Mis à jour' },
  es: { jumpTo: 'Ir a', quickAnswer: 'Respuesta rápida', onThisPage: 'En esta página', nextSteps: 'Siguientes pasos', updated: 'Actualizado' },
  de: { jumpTo: 'Springen zu', quickAnswer: 'Kurzantwort', onThisPage: 'Auf dieser Seite', nextSteps: 'Nächste Schritte', updated: 'Aktualisiert' },
} as const;

export function ArticleLayout({ post, locale = 'en' }: { post: Post; locale?: SupportedLocale }) {
  const t = copy[locale];
  const dateLocale = intlLocale(locale);

  return (
    <article className="article stack">
      <header>
        <div className="badges">
          <span className="badge">{post.type.toUpperCase()}</span>
          {post.primaryKeyword ? <span className="badge">KW: {post.primaryKeyword}</span> : null}
          {post.updatedAt ? <span className="badge">{t.updated}: {new Date(post.updatedAt).toLocaleDateString(dateLocale)}</span> : null}
        </div>
        <h1>{post.title}</h1>
        <p className="lede">{post.description}</p>

        {post.jumpLinks?.length ? (
          <div className="card">
            <strong>{t.jumpTo}</strong>
            <ul className="list">
              {post.jumpLinks.map((j) => (
                <li key={j.href}>
                  <a href={j.href}>{j.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </header>

      <div className="grid">
        <div className="stack">
          {/* Quick answer block: visible fast */}
          {post.quickAnswer?.length ? (
            <section className="card" aria-label="Quick answer">
              <strong>{t.quickAnswer}</strong>
              <ul className="list">
                {post.quickAnswer.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* MDX content */}
          <div className="stack">{post.content}</div>

          {/* CTA */}
          {post.cta ? (
            <CTABox title={post.cta.title} body={post.cta.body} buttonLabel={post.cta.buttonLabel} buttonHref={post.cta.buttonHref} />
          ) : null}

          <hr className="hr" />

          {/* FAQ */}
          {post.faq?.length ? <FAQ items={post.faq} /> : null}

          {/* Next steps */}
          {post.internalLinks?.length ? (
            <section className="card">
              <h2 id="next-steps">{t.nextSteps}</h2>
              <ul className="list">
                {post.internalLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} data-placement="next_steps">{l.anchor}</Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="toc" aria-label="Table of contents">
          <div className="card">
            <strong>{t.onThisPage}</strong>
            <TableOfContents headings={post.headings} />
          </div>
        </aside>
      </div>
    </article>
  );
}
