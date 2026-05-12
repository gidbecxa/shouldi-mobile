// Dynamic app config — allows env vars (e.g. GOOGLE_SERVICES_JSON) to be
// injected by EAS Build without committing the file to git.
/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  name: "Should I?",
  slug: "shouldi-mobile",
  owner: "thegideona",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: "shouldi",
  userInterfaceStyle: "dark",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.thegideona.shouldi",
    associatedDomains: ["applinks:shouldi.fun"],
  },
  android: {
    package: "com.thegideona.shouldi",
    // EAS injects the GOOGLE_SERVICES_JSON secret file variable at build time.
    // Locally, fall back to the file in the project root (gitignored).
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0a0a0b",
    },
    predictiveBackGestureEnabled: false,
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: "https",
            host: "shouldi.fun",
            pathPrefix: "/q",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-localization",
    "expo-secure-store",
    [
      "expo-splash-screen",
      {
        image: "./assets/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#0a0a0b",
      },
    ],
    [
      "expo-notifications",
      {
        defaultChannel: "default",
        androidMode: "default",
        androidCollapsedTitle: "Should I?",
      },
    ],
    "expo-font",
    "expo-web-browser",
    [
      "@react-native-google-signin/google-signin",
      {
        iosUrlScheme:
          "com.googleusercontent.apps.513422513086-v2oubk5p12etlr1h2h88hicpj5mgpq2a",
      },
    ],
  ],
  extra: {
    router: {},
    eas: {
      projectId: "31069e86-1a86-42c4-8c71-f82d2678a188",
    },
  },
};
