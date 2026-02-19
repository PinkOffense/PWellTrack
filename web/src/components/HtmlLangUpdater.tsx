'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Client component that keeps the <html lang> attribute
 * in sync with the current i18n language.
 */
export function HtmlLangUpdater() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // Also listen for language changes
  useEffect(() => {
    const handler = (lng: string) => {
      document.documentElement.lang = lng;
    };
    i18n.on('languageChanged', handler);
    return () => { i18n.off('languageChanged', handler); };
  }, [i18n]);

  return null;
}
