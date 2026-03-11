'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { localeFromPathname } from '@/lib/i18n';

export function LangHtmlUpdater() {
  const pathname = usePathname() ?? '/';

  useEffect(() => {
    try {
      document.documentElement.lang = localeFromPathname(pathname);
    } catch {
      // ignore
    }
  }, [pathname]);

  return null;
}

