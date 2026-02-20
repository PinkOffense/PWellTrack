import { createI18n } from 'vue-i18n';
import en from './en';
import pt from './pt';

const savedLang = typeof window !== 'undefined'
  ? localStorage.getItem('pwelltrack_lang') || 'pt'
  : 'pt';

export const i18n = createI18n({
  legacy: false,
  locale: savedLang,
  fallbackLocale: 'en',
  messages: { en, pt },
});
