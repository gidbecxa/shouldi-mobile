import Ionicons from "@expo/vector-icons/Ionicons";
import { memo, useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { typeScale, typography } from "../constants/typography";
import { Question } from "../lib/api";
import { getTimeLeftLabel, getUrgencyTier } from "../lib/time";
import { CategoryBadge } from "./CategoryBadge";
import { PressableScale } from "./PressableScale";
import { ResultBar } from "./ResultBar";
import { VoteButtons } from "./VoteButtons";

type FeedQuestionCardProps = {
  question: Question;
  hasVoted: boolean;
  isVoteSubmitting?: boolean;
  pendingVote?: "yes" | "no" | null;
  onVote: (questionId: string, vote: "yes" | "no") => void;
  onOpen: (questionId: string) => void;
  animateDelay?: number;
};

function getUrgencyColor(expiresAt: string) {
  const tier = getUrgencyTier(expiresAt);

  if (tier === "safe") return colors.yes;
  if (tier === "warning") return colors.warning;
  if (tier === "critical") return colors.no;
  return colors.textMuted;
}

export const FeedQuestionCard = memo(function FeedQuestionCard({
  question,
  hasVoted,
  isVoteSubmitting = false,
  pendingVote = null,
  onVote,
  onOpen,
  animateDelay = 0,
}: FeedQuestionCardProps) {
  const timeLeft = getTimeLeftLabel(question.expires_at);
  const isClosed = timeLeft === "Closed";
  const { t } = useTranslation();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        delay: animateDelay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        delay: animateDelay,
        useNativeDriver: true,
      }),
    ]).start();
  // Intentionally run once on mount — animateDelay is stable per card position
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <PressableScale
        onPress={() => onOpen(question.id)}
        style={{
          borderRadius: spacing.lg,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          overflow: "hidden",
        }}
      >
        <View style={{ padding: spacing.base, gap: spacing.md }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <CategoryBadge category={question.category} />

            {isClosed ? (
              <Text style={{ ...typeScale.micro, color: colors.textMuted, letterSpacing: 0.8, textTransform: "uppercase" }}>
                {t('feed.closed')}
              </Text>
            ) : (
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
                <View
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 3.5,
                    backgroundColor: getUrgencyColor(question.expires_at),
                  }}
                />
                <Text style={{ ...typeScale.caption, color: colors.textMuted, fontFamily: typography.mono }}>
                  {timeLeft}
                </Text>
              </View>
            )}
          </View>

          <Text
            numberOfLines={3}
            ellipsizeMode="tail"
            style={{
              ...typeScale.display_sm,
              color: colors.textPrimary,
              letterSpacing: -0.2,
            }}
          >
            {question.text}
          </Text>

          {hasVoted ? (
            <View style={{ gap: spacing.sm }}>
              <ResultBar yesPercent={question.yes_percent} noPercent={100 - question.yes_percent} height={8} />
              <Text style={{ ...typeScale.micro, color: colors.textMuted }}>
                <Text style={{ color: colors.yes }}>YES {question.yes_percent}%</Text>
                <Text> · {t('feed.votes', { count: question.total_votes })} · {question.user_voted === 'yes' ? t('feed.youVotedYes') : t('feed.youVotedNo')}</Text>
              </Text>
            </View>
          ) : (
            <>
              <VoteButtons
                onVote={(vote) => onVote(question.id, vote)}
                disabled={isVoteSubmitting}
                pendingVote={pendingVote}
              />

              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ ...typeScale.micro, color: colors.textMuted }}>
                  {t('feed.votes', { count: question.total_votes })}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
                  <Text style={{ ...typeScale.caption, color: colors.brand }}>{t('feed.seeWhoIsWinning')}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.brand} />
                </View>
              </View>
            </>
          )}
        </View>
      </PressableScale>
    </Animated.View>
  );
});
