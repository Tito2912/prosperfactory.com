import { isValidElement, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import Link from 'next/link';
import { slugifyHeading } from '@/lib/slug';
import { inferAffiliateIdFromHref, isExternalHref } from '@/lib/affiliates';

function toPlainText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(toPlainText).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return toPlainText(node.props.children ?? '');
  return '';
}

function Heading({
  as: As,
  children,
  ...props
}: {
  as: 'h2' | 'h3' | 'h4';
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'h2'>, 'children'>) {
  const text = toPlainText(children ?? '');
  const id = slugifyHeading(text);
  return (
    <As id={id} {...props}>
      {children}
    </As>
  );
}

export const mdxComponents = {
  h2: (props: ComponentPropsWithoutRef<'h2'>) => <Heading as="h2" {...props} />,
  h3: (props: ComponentPropsWithoutRef<'h3'>) => <Heading as="h3" {...props} />,
  h4: (props: ComponentPropsWithoutRef<'h4'>) => <Heading as="h4" {...props} />,
  a: ({ href, rel, children, ...props }: ComponentPropsWithoutRef<'a'>) => {
    const rawHref = typeof href === 'string' ? href : '';
    const isExternal = rawHref ? isExternalHref(rawHref) : false;
    const affiliateId = isExternal && rawHref ? inferAffiliateIdFromHref(rawHref) : undefined;

    const nextRel =
      rel ??
      (affiliateId ? 'nofollow sponsored noopener noreferrer' : isExternal ? 'noopener noreferrer' : undefined);

    const dataAffiliate = affiliateId ?? (props as any)['data-affiliate'];
    const dataPlacement = affiliateId ? 'content' : (props as any)['data-placement'];

    if (rawHref.startsWith('/')) {
      return (
        <Link href={rawHref} rel={nextRel} data-placement={dataPlacement} {...props}>
          {children}
        </Link>
      );
    }

    return (
      <a
        href={rawHref}
        rel={nextRel}
        data-affiliate={dataAffiliate}
        data-placement={dataPlacement}
        {...props}
      >
        {children}
      </a>
    );
  },
};
