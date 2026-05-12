import Ionicons from "@expo/vector-icons/Ionicons";
import { GestureResponderEvent, Text, View } from "react-native";

import { colors } from "../constants/colors";
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

function getTimerDotColor(expiresAt: string, isClosed: boolean) {
  if (isClosed) {
    return colors.textMuted;
  }

  const remainingMs = getTimeRemainingMs(expiresAt);
  if (remainingMs <= 60 * 60 * 1000) {
    return colors.no;
  }

  if (remainingMs <= 6 * 60 * 60 * 1000) {
    return colors.warning;
  }

  return colors.yes;
}

function getExpiryLabel(expiresAt: string, isClosed: boolean) {
  if (isClosed) {
    return getClosedLabel(expiresAt) ?? "Closed";
  }

  return getTimeLeftLabel(expiresAt);
}

export function MineQuestionCard({ question, onOpen, onDelete }: MineQuestionCardProps) {
  const timeLeft = getTimeLeftLabel(question.expires_at);
  const isClosed = timeLeft === "Closed";
  const expiryLabel = getExpiryLabel(question.expires_at, isClosed);
  const timerDotColor = getTimerDotColor(question.expires_at, isClosed);

  return (
    <PressableScale
      onPress={() => onOpen(question.id)}
      style={{
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        overflow: "hidden",
        padding: 20,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <CategoryBadge category={question.category} />

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              borderRadius: 999,
              borderWidth: 1,
              borderColor: isClosed ? colors.noBorder : colors.yesBorder,
              backgroundColor: isClosed ? colors.noSoft : colors.yesSoft,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
          >
            <Text style={{ ...typeScale.micro, color: isClosed ? colors.no : colors.yes }}>
              {isClosed ? "CLOSED" : "ACTIVE"}
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
          marginTop: 14,
          marginBottom: 16,
          letterSpacing: -0.2,
        }}
      >
        {question.text}
      </Text>

      {question.total_votes > 0 && (
        <View style={{ marginBottom: 10 }}>
          <ResultBar yesPercent={question.yes_percent} noPercent={100 - question.yes_percent} height={8} />
        </View>
      )}

      {question.total_votes > 0 ? (
        <Text style={{ ...typeScale.micro, color: colors.textMuted, marginBottom: 14 }}>
          <Text style={{ color: colors.yes }}>YES {question.yes_percent}%</Text>
          <Text>{"  ·  "}</Text>
          <Text>{question.total_votes.toLocaleString()} votes</Text>
          <Text>{"  ·  "}</Text>
          <Text style={{ color: colors.no }}>NO {100 - question.yes_percent}%</Text>
        </Text>
      ) : (
        <Text style={{ ...typeScale.micro, color: colors.textMuted, marginBottom: 14 }}>
          No votes yet
        </Text>
      )}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <View
          style={{
            width: 7,
            height: 7,
            borderRadius: 999,
            backgroundColor: timerDotColor,
          }}
        />
        <Text style={{ ...typeScale.micro, color: colors.textSecondary }}>
          {expiryLabel}
        </Text>
      </View>
    </PressableScale>
  );
}
