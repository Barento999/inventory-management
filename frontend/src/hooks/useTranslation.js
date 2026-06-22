import { useCallback, useState } from 'react';
import en from '../locales/en.json';

// Language pack storage
const languages = {
  en,
};

/**
 * Hook for translations (i18n)
 * Usage: const t = useTranslation()
 *        t('common.save')  // Returns "Save"
 *        t('validation.minLength', { min: 5 })  // With interpolation
 */
export function useTranslation(lang = 'en') {
  const translate = useCallback(
    (key, params = {}) => {
      const keys = key.split('.');
      let value = languages[lang] || languages.en;

      for (const k of keys) {
        if (value[k] === undefined) {
          console.warn(`Translation key not found: ${key}`);
          return key;
        }
        value = value[k];
      }

      // Replace parameters
      if (typeof value === 'string' && Object.keys(params).length > 0) {
        return value.replace(/{(\w+)}/g, (match, param) => params[param] || match);
      }

      return value;
    },
    [lang]
  );

  return translate;
}

/**
 * Hook for getting all translations
 */
export function useLanguage(lang = 'en') {
  return languages[lang] || languages.en;
}

/**
 * Hook for managing current language
 */
export function useLanguageManager() {
  const [language, setLanguage] = useState(() => {
    // Get from localStorage or browser default
    return localStorage.getItem('language') || navigator.language.split('-')[0] || 'en';
  });

  const changeLanguage = (lang) => {
    if (languages[lang]) {
      setLanguage(lang);
      localStorage.setItem('language', lang);
    }
  };

  const availableLanguages = Object.keys(languages);

  return {
    language,
    changeLanguage,
    availableLanguages,
  };
}

/**
 * Add a new language pack
 */
export function addLanguage(lang, translations) {
  languages[lang] = translations;
}

/**
 * Get available languages
 */
export function getAvailableLanguages() {
  return Object.keys(languages);
}
