import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pf-site">
      <SiteHeader />
      <main className="container">{children}</main>
      <SiteFooter />
    </div>
  );
}
