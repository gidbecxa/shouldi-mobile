import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { AppBackdrop } from "../components/AppBackdrop";
import { PressableScale } from "../components/PressableScale";
import { colors } from "../constants/colors";
import { categories } from "../constants/categories";
import { spacing } from "../constants/spacing";
import { typeScale, typography } from "../constants/typography";
import { createQuestion, getLiveStats } from "../lib/api";
import { getCurrentLanguage } from "../lib/i18n";
import { useFeedStore } from "../store/feedStore";
import { useMineStore } from "../store/mineStore";
import { useUserStore } from "../store/userStore";

const durations = [
  { label: "1h", value: 1 },
  { label: "6h", value: 6 },
  { label: "24h", value: 24 },
  { label: "3d", value: 72 },
] as const;

function OptionChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(active ? 1.04 : 1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    scale.value = withSpring(active ? 1.04 : 1, { damping: 16, stiffness: 240 });
  }, [active, scale]);

  return (
    <Animated.View style={animatedStyle}>
      <PressableScale
        onPress={onPress}
        style={{
          borderRadius: 9,
          borderWidth: 1,
          borderColor: active ? "rgba(167,139,250,0.50)" : colors.border,
          backgroundColor: active ? colors.brandMedium : colors.surface,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
        }}
      >
        <Text
          style={{
            ...typeScale.caption,
            color: active ? colors.brand : colors.textSecondary,
            fontFamily: active ? typography.bodyBold : typography.body,
          }}
        >
          {label}
        </Text>
      </PressableScale>
    </Animated.View>
  );
}

export default function PostScreen() {
  const accessToken = useUserStore((state) => state.accessToken);
  const insertFeedQuestion = useFeedStore((state) => state.insertQuestion);
  const prependMineQuestion = useMineStore((state) => state.prependMineQuestion);
  const { t } = useTranslation();
  const placeholders = t('post.placeholderExamples', { returnObjects: true }) as unknown as string[];
  const [placeholder] = useState(() => placeholders[Math.floor(Math.random() * placeholders.length)] ?? t('post.placeholder'));
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("Life");
  const [durationHours, setDurationHours] = useState<(typeof durations)[number]["value"]>(24);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [activeVoters, setActiveVoters] = useState(0);

  useEffect(() => {
    getLiveStats().then((data) => setActiveVoters(data.active_voters_last_hour)).catch(() => {});
  }, []);

  const charCount = question.length;
  const counterColor =
    charCount <= 100 ? colors.textMuted : charCount <= 110 ? colors.warning : colors.no;
  const isTooLong = charCount >= 120;

  const submitQuestion = async () => {
    if (!accessToken) {
      setStatusMessage(t('post.signInRequired'));
      return;
    }

    if (question.trim().length === 0) {
      setStatusMessage(t('post.enterQuestion'));
      return;
    }

    try {
      setIsPosting(true);
      setStatusMessage(null);
      const payload = await createQuestion(accessToken, {
        text: question.trim(),
        category,
        duration_hours: durationHours,
        language: getCurrentLanguage(),
      });

      insertFeedQuestion(payload.question);
      prependMineQuestion(payload.question);
      setQuestion("");
      setStatusMessage(t('post.posted'));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : t('errors.generic'));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: spacing.base,
          gap: spacing.base,
          paddingBottom: 140,
        }}
      >
        <View style={{ gap: spacing.xs }}>
          <Text
            style={{
              ...typeScale.display_lg,
              color: colors.textPrimary,
              letterSpacing: -1,
            }}
          >
            {t('post.header')}
          </Text>
          <Text style={{ ...typeScale.caption, color: colors.textSecondary, fontFamily: typography.mono }}>
            {t('post.subheader', { max: 120 })}
          </Text>
        </View>

        <View
          style={{
            borderRadius: spacing.lg,
            borderWidth: 1.5,
            borderColor: charCount > 110 ? colors.no : charCount > 100 ? colors.warning : question.length > 0 ? colors.brandBorder : colors.border,
            backgroundColor: colors.card,
            padding: spacing.base,
          }}
        >
          <TextInput
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            value={question}
            onChangeText={setQuestion}
            maxLength={120}
            multiline
            autoFocus={false}
            style={{
              minHeight: 120,
              color: colors.textPrimary,
              backgroundColor: "transparent",
              textAlignVertical: "top",
              fontFamily: typography.display,
              fontSize: 20,
              lineHeight: 28,
              letterSpacing: -0.2,
            }}
          />
        </View>

        <Text style={{ ...typeScale.micro, color: counterColor, textAlign: "center", fontFamily: typography.mono }}>
          {charCount} / 120
        </Text>

        <View style={{ height: 1, backgroundColor: colors.border, marginVertical: spacing.xl }} />

        <View
          style={{
            borderRadius: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: spacing.base,
            gap: spacing.md,
          }}
        >
          <View style={{ gap: spacing.sm }}>
            <Text style={{ ...typeScale.caption, color: colors.textSecondary }}>
              {t('post.categoryLabel')}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
              {categories.map((item) => {
                const active = category === item;
                return (
                  <OptionChip key={item} label={item} active={active} onPress={() => setCategory(item)} />
                );
              })}
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: colors.border }} />

          <View style={{ gap: spacing.sm }}>
            <Text style={{ ...typeScale.caption, color: colors.textSecondary }}>
              {t('post.windowLabel')}
            </Text>
            <View style={{ flexDirection: "row", gap: spacing.sm }}>
              {durations.map((duration) => {
                const active = durationHours === duration.value;
                return (
                  <PressableScale
                    key={duration.value}
                    onPress={() => setDurationHours(duration.value)}
                    style={{
                      flex: 1,
                      borderRadius: 9,
                      borderWidth: 1,
                      borderColor: active ? "rgba(167,139,250,0.50)" : colors.border,
                      backgroundColor: active ? colors.brandMedium : colors.surface,
                      paddingVertical: spacing.sm,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        ...typeScale.caption,
                        color: active ? colors.brand : colors.textSecondary,
                        fontFamily: active ? typography.bodyBold : typography.body,
                      }}
                    >
                      {duration.label}
                    </Text>
                  </PressableScale>
                );
              })}
            </View>
          </View>
        </View>

        <PressableScale
          onPress={() => {
            void submitQuestion();
          }}
          disabled={isPosting || isTooLong}
          style={{
            alignItems: "center",
            borderRadius: spacing.base,
            backgroundColor: isPosting || isTooLong ? colors.surface : colors.brand,
            paddingVertical: spacing.base,
            opacity: isPosting || isTooLong ? 0.4 : 1,
            shadowColor: colors.brand,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isPosting || isTooLong ? 0 : 0.4,
            shadowRadius: 12,
            elevation: isPosting || isTooLong ? 0 : 6,
          }}
        >
          <Text style={{ ...typeScale.title, color: colors.textPrimary, fontFamily: typography.bodyBold }}>
            {isPosting ? t('post.posting') : isTooLong ? t('post.tooLong') : t('post.publishButton')}
          </Text>
        </PressableScale>

        {activeVoters > 10 && (
          <Text
            style={{
              textAlign: "center",
              marginTop: 4,
              fontSize: 13,
              fontFamily: typography.mono,
              color: "#52525B",
            }}
          >
            {t('feed.liveVoters', { count: activeVoters })}
          </Text>
        )}

        {statusMessage ? (
          <Text
            style={{
              ...typeScale.body,
              color: statusMessage.startsWith("Posted") || statusMessage.startsWith("Publié") ? colors.yes : colors.textSecondary,
              textAlign: "center",
            }}
          >
            {statusMessage}
          </Text>
        ) : null}
      </ScrollView>

      <AppBackdrop />
    </KeyboardAvoidingView>
  );
}

