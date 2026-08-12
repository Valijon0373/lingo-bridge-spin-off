import fs from 'fs';
import path from 'path';
import { logger } from '../config/logger.config';

type SupportedLang = 'uz' | 'ru' | 'en';

class I18n {
  private translations: Record<SupportedLang, Record<string, string>> = {
    uz: {},
    ru: {},
    en: {},
  };

  constructor() {
    this.loadTranslations();
  }

  private loadTranslations() {
    const languages: SupportedLang[] = ['uz', 'ru', 'en'];

    for (const lang of languages) {
      const candidatePaths = [
        path.resolve(__dirname, `../locales/${lang}/common.json`),
        path.resolve(process.cwd(), `dist/locales/${lang}/common.json`),
        path.resolve(process.cwd(), `src/locales/${lang}/common.json`),
      ];

      let loaded = false;
      for (const filePath of candidatePaths) {
        try {
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            this.translations[lang] = JSON.parse(content);
            loaded = true;
            break;
          }
        } catch (error) {
          logger.error(`Error loading translation file at ${filePath} for ${lang}:`, error);
        }
      }

      if (!loaded) {
        logger.warn(`Translation file not found for ${lang} in candidate paths.`);
      }
    }
  }

  public t(lang: string | undefined | null, key: string, params?: Record<string, string | number>): string {
    const selectedLang: SupportedLang = (lang === 'ru' || lang === 'en') ? lang : 'uz';
    let text = this.translations[selectedLang]?.[key] || this.translations['uz']?.[key] || key;

    if (params) {
      Object.keys(params).forEach((paramKey) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(params[paramKey]));
      });
    }

    text = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

    return text;
  }
}

export const i18n = new I18n();
export const t = (lang: string | undefined | null, key: string, params?: Record<string, string | number>) =>
  i18n.t(lang, key, params);
