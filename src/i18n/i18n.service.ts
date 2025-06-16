import { Injectable } from '@nestjs/common';

export interface Localization {
  startMessage: string;
}

@Injectable()
export class I18nService {
  private translations: Record<string, Localization> = {
    ru: {
      startMessage: 'Привет! Я бот для практики английского. Давай общаться!',
    },
    en: {
      startMessage: "Hi! I'm your English practice bot. Let's chat!",
    },
    es: {
      startMessage: '¡Hola! Soy tu bot de práctica de inglés. ¡Hablemos!',
    },
    de: {
      startMessage: 'Hallo! Ich bin dein Englisch-Übungsbot. Lass uns reden!',
    },
  };

  /**
   * Get localized text based on language code
   * @param key The key of the text to get
   * @param lang The language code (e.g., 'en', 'ru')
   * @returns The localized text
   */
  public getLocalizedText(key: keyof Localization, lang: string): string {
    const defaultLang = 'en';
    const localization = this.translations[lang] || this.translations[defaultLang];
    return localization[key];
  }

  /**
   * Get all available translations
   * @returns The translations object
   */
  public getTranslations(): Record<string, Localization> {
    return this.translations;
  }
}