import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

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
  animateIn?: boolean;
  animateDelay?: number;
};

function getUrgencyColor(expiresAt: string) {
  const tier = getUrgencyTier(expiresAt);

  if (tier === "safe") return colors.yes;
  if (tier === "warning") return colors.warning;
  if (tier === "critical") return colors.no;
  return colors.textMuted;
}

export function FeedQuestionCard({
  question,
  hasVoted,
  isVoteSubmitting = false,
  pendingVote = null,
  onVote,
  onOpen,
  animateIn = false,
  animateDelay = 0,
}: FeedQuestionCardProps) {
  const timeLeft = getTimeLeftLabel(question.expires_at);
  const isClosed = timeLeft === "Closed";
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    if (!animateIn) {
      opacity.setValue(0);
      translateY.setValue(12);
      return;
    }

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
  }, [animateDelay, animateIn, opacity, translateY]);

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
                Closed
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
                <Text> · {question.total_votes.toLocaleString()} votes · You voted </Text>
                <Text style={{ color: question.user_voted === "yes" ? colors.yes : colors.no }}>
                  {question.user_voted?.toUpperCase()}
                </Text>
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
                  {question.total_votes.toLocaleString()} votes
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
                  <Text style={{ ...typeScale.caption, color: colors.brand }}>See who's winning</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.brand} />
                </View>
              </View>
            </>
          )}
        </View>
      </PressableScale>
    </Animated.View>
  );
}
