import Ionicons from "@expo/vector-icons/Ionicons";
import { GestureResponderEvent, Text, View } from "react-native";

import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { typeScale } from "../constants/typography";
import { Question } from "../lib/api";
import { getTimeLeftLabel, getTimeRemainingMs } from "../lib/time";
import { CategoryBadge } from "./CategoryBadge";
import { PressableScale } from "./PressableScale";
import { ResultBar } from "./ResultBar";

type MineQuestionCardProps = {
  question: Question;
  onOpen: (questionId: string) => void;
  onDelete: (questionId: string) => void;
};

function getClosedLabel(expiresAt: string) {
  const diffMs = Date.now() - new Date(expiresAt).getTime();
  if (diffMs <= 0) return null;

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));

  if (days >= 1) {
    return `Closed ${days}d ago`;
  }

  return `Closed ${Math.max(hours, 1)}h ago`;
}

export function MineQuestionCard({ question, onOpen, onDelete }: MineQuestionCardProps) {
  const timeLeft = getTimeLeftLabel(question.expires_at);
  const isClosed = timeLeft === "Closed";
  const closedLabel = getClosedLabel(question.expires_at);

  return (
    <View style={{ position: "relative" }}>
      <View
        style={{
          position: "absolute",
          left: spacing.xs,
          top: spacing.md,
          bottom: spacing.md,
          width: 2,
          borderRadius: 999,
          backgroundColor: colors.brand,
        }}
      />

      <PressableScale
        onPress={() => onOpen(question.id)}
        style={{
          borderRadius: spacing.lg,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          overflow: "hidden",
          padding: spacing.base,
          gap: spacing.md,
          paddingLeft: spacing.lg,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <CategoryBadge category={question.category} />

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                borderRadius: 999,
                borderWidth: 1,
                borderColor: isClosed ? colors.border : colors.yesBorder,
                backgroundColor: isClosed ? colors.surface : colors.yesSoft,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                marginRight: spacing.sm,
              }}
            >
              <Text style={{ ...typeScale.micro, color: isClosed ? colors.textMuted : colors.yes }}>
                {isClosed ? "CLOSED" : "● ACTIVE"}
              </Text>
            </View>

            <PressableScale
              onPress={(event: GestureResponderEvent) => {
                event.stopPropagation();
                onDelete(question.id);
              }}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
            </PressableScale>
          </View>
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

        <ResultBar yesPercent={question.yes_percent} noPercent={100 - question.yes_percent} height={8} />

        <Text style={{ ...typeScale.micro, color: colors.textMuted }}>
          <Text style={{ color: colors.yes }}>YES {question.yes_percent}%</Text>
          <Text> · </Text>
          <Text style={{ color: colors.no }}>NO {100 - question.yes_percent}%</Text>
          <Text> · {question.total_votes.toLocaleString()} votes</Text>
        </Text>

        <Text style={{ ...typeScale.micro, color: colors.textMuted }}>
          {isClosed ? closedLabel ?? "Closed" : `${Math.ceil(getTimeRemainingMs(question.expires_at) / 3_600_000)}h left`}
        </Text>
      </PressableScale>
    </View>
  );
}
