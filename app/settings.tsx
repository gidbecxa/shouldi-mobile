import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../hooks/useLanguage";

const appVersion = Constants.expoConfig?.version ?? "1.0.0";

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.container, { paddingTop: insets.top }]}>

        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.canGoBack() ? router.back() : router.replace("/")}
            style={styles.backButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color="#FAFAFA" />
          </Pressable>
          <Text style={styles.headerTitle}>{t("settings.header")}</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
        >

          {/* ── Language ──────────────────────────────────────────── */}
          <Text style={styles.sectionLabel}>{t("settings.language")}</Text>
          <View style={styles.card}>
            <View style={styles.languageRow}>
              {(["en", "fr"] as const).map((lang) => (
                <Pressable
                  key={lang}
                  onPress={() => void changeLanguage(lang)}
                  style={[styles.langPill, language === lang && styles.langPillActive]}
                >
                  <Text style={[styles.langPillText, language === lang && styles.langPillTextActive]}>
                    {lang === "en" ? "🇬🇧  English" : "🇫🇷  Français"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* ── Account ───────────────────────────────────────────── */}
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.card}>
            <SettingsRow
              icon="person-outline"
              label="Anonymous user"
              value="No sign-in required"
              isInfo
            />
          </View>

          {/* ── About ─────────────────────────────────────────────── */}
          <Text style={styles.sectionLabel}>About</Text>
          <View style={styles.card}>
            <SettingsRow
              icon="shield-checkmark-outline"
              label="Privacy Policy"
              onPress={() => void Linking.openURL("https://shouldi.fun/privacy")}
            />
            <Divider />
            <SettingsRow
              icon="document-text-outline"
              label="Terms of Service"
              onPress={() => void Linking.openURL("https://shouldi.fun/terms")}
            />
            <Divider />
            <SettingsRow
              icon="mail-outline"
              label="Support"
              value="support@shouldi.fun"
              onPress={() => void Linking.openURL("mailto:support@shouldi.fun")}
            />
            <Divider />
            <SettingsRow
              icon="bug-outline"
              label="Report a Bug"
              onPress={() => void Linking.openURL("mailto:support@shouldi.fun?subject=Bug Report")}
            />
          </View>

          {/* ── App ───────────────────────────────────────────────── */}
          <Text style={styles.sectionLabel}>App</Text>
          <View style={styles.card}>
            <SettingsRow
              icon="information-circle-outline"
              label="Version"
              value={appVersion}
              isInfo
            />
          </View>

          {/* Brand footer */}
          <View style={styles.brandFooter}>
            <Text style={styles.brandWordmark}>Should I?</Text>
            <Text style={styles.brandTagline}>Let the crowd decide.</Text>
          </View>

        </ScrollView>
      </View>
    </>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  isInfo = false,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  isInfo?: boolean;
}) {
  const content = (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon as any} size={20} color="#A1A1AA" style={{ marginRight: 12 }} />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        {!isInfo ? <Ionicons name="chevron-forward" size={16} color="#52525B" /> : null}
      </View>
    </View>
  );

  if (isInfo || !onPress) return content;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
      {content}
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090B",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.07)",
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Syne_700Bold",
    fontSize: 18,
    color: "#FAFAFA",
  },
  scrollContent: {
    padding: 20,
  },
  sectionLabel: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 12,
    color: "#52525B",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 24,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#18181B",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  languageRow: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
  },
  langPill: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#27272B",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    alignItems: "center",
  },
  langPillActive: {
    backgroundColor: "rgba(167,139,250,0.18)",
    borderColor: "rgba(167,139,250,0.50)",
  },
  langPillText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 14,
    color: "#A1A1AA",
  },
  langPillTextActive: {
    color: "#A78BFA",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    minHeight: 52,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rowLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 15,
    color: "#FAFAFA",
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  rowValue: {
    fontFamily: "DMMono_500Medium",
    fontSize: 13,
    color: "#52525B",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginHorizontal: 16,
  },
  brandFooter: {
    alignItems: "center",
    marginTop: 48,
    gap: 4,
  },
  brandWordmark: {
    fontFamily: "Syne_800ExtraBold",
    fontSize: 22,
    color: "#A78BFA",
  },
  brandTagline: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: "#3F3F46",
  },
});

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
