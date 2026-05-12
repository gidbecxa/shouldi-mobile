import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getCurrentLanguage, setLanguage, SupportedLanguage } from '../lib/i18n';

export function useLanguage() {
  const { i18n } = useTranslation();
  const [language, setLang] = useState<SupportedLanguage>(getCurrentLanguage());

  const changeLanguage = useCallback(
    async (lang: SupportedLanguage) => {
      await setLanguage(lang);
      setLang(lang);
    },
    [],
  );

  // Keep local state in sync if i18n language changes externally
  const currentLang = i18n.language?.startsWith('fr') ? 'fr' : ('en' as SupportedLanguage);
  if (currentLang !== language) {
    setLang(currentLang);
  }

  return { language, changeLanguage };
}
