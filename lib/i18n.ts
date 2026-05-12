import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { en } from '../locales/en';
import { fr } from '../locales/fr';

const LANGUAGE_KEY = 'user_language';
const SUPPORTED_LANGUAGES = ['en', 'fr'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

function resolveDeviceLanguage(): SupportedLanguage {
  const locale = getLocales()[0]?.languageCode ?? 'en';
  return locale.startsWith('fr') ? 'fr' : 'en';
}

export async function getInitialLanguage(): Promise<SupportedLanguage> {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored as SupportedLanguage)) {
      return stored as SupportedLanguage;
    }
  } catch {}
  return resolveDeviceLanguage();
}

export async function setLanguage(lang: SupportedLanguage): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  await i18n.changeLanguage(lang);
}

export function getCurrentLanguage(): SupportedLanguage {
  const lang = i18n.language;
  return lang?.startsWith('fr') ? 'fr' : 'en';
}

// Initialize synchronously with device language — async preference will override on app boot
const deviceLang = resolveDeviceLanguage();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: deviceLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

// Override with stored preference asynchronously
getInitialLanguage().then((lang) => {
  if (lang !== i18n.language) {
    i18n.changeLanguage(lang);
  }
});

export default i18n;
