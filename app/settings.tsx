import { useRouter } from "expo-router";
import { Text, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { useLanguage } from "../hooks/useLanguage";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { typeScale, typography } from "../constants/typography";
import { PressableScale } from "../components/PressableScale";

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: spacing.base,
          paddingVertical: spacing.md,
          gap: spacing.sm,
        }}
      >
        <PressableScale onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={{ padding: spacing.xs }}>
          <Text style={{ ...typeScale.title, color: colors.brand }}>←</Text>
        </PressableScale>
        <Text style={{ ...typeScale.title, color: colors.textPrimary, fontFamily: typography.display }}>
          {t("settings.header")}
        </Text>
      </View>

      <View style={{ paddingHorizontal: spacing.base, gap: spacing.xl }}>
        {/* Language Section */}
        <View style={{ gap: spacing.sm }}>
          <Text style={{ ...typeScale.caption, color: colors.textSecondary, letterSpacing: 0.8, textTransform: "uppercase" }}>
            {t("settings.language")}
          </Text>

          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            {/* English pill */}
            <Pressable
              onPress={() => void changeLanguage("en")}
              style={{
                flex: 1,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: language === "en" ? "rgba(167,139,250,0.50)" : colors.border,
                backgroundColor: language === "en" ? "rgba(167,139,250,0.18)" : colors.surface,
                paddingVertical: spacing.md,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  ...typeScale.caption,
                  fontFamily: typography.bodyBold,
                  color: language === "en" ? colors.brand : colors.textSecondary,
                }}
              >
                🇬🇧  {t("settings.languageEN")}
              </Text>
            </Pressable>

            {/* French pill */}
            <Pressable
              onPress={() => void changeLanguage("fr")}
              style={{
                flex: 1,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: language === "fr" ? "rgba(167,139,250,0.50)" : colors.border,
                backgroundColor: language === "fr" ? "rgba(167,139,250,0.18)" : colors.surface,
                paddingVertical: spacing.md,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  ...typeScale.caption,
                  fontFamily: typography.bodyBold,
                  color: language === "fr" ? colors.brand : colors.textSecondary,
                }}
              >
                🇫🇷  {t("settings.languageFR")}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Support */}
        <View style={{ gap: spacing.sm }}>
          <Text style={{ ...typeScale.caption, color: colors.textSecondary, letterSpacing: 0.8, textTransform: "uppercase" }}>
            Support
          </Text>
          <Text style={{ ...typeScale.caption, color: colors.textMuted }}>
            {t("settings.support")}
          </Text>
        </View>
      </View>
    </View>
  );
}
