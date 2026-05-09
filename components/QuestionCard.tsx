import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

import { colors } from "../constants/colors";
import { typography } from "../constants/typography";
import { getTimeLeftLabel } from "../lib/time";
import { Question } from "../lib/api";
import { CategoryBadge } from "./CategoryBadge";
import { PressableScale } from "./PressableScale";
import { ResultBar } from "./ResultBar";
import { VoteButtons } from "./VoteButtons";

type QuestionCardProps = {
  question: Question;
  hasVoted: boolean;
  isVoteSubmitting?: boolean;
  pendingVote?: "yes" | "no" | null;
  onVote: (questionId: string, vote: "yes" | "no") => void;
  onOpen: (questionId: string) => void;
};

export function QuestionCard({
  question,
  hasVoted,
  isVoteSubmitting = false,
  pendingVote = null,
  onVote,
  onOpen,
}: QuestionCardProps) {
  const timeLeft = getTimeLeftLabel(question.expires_at);
  const isClosed = timeLeft === "Closed";

  return (
    <PressableScale
      onPress={() => onOpen(question.id)}
      style={{
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        overflow: "hidden",
      }}
    >
      <View style={{ padding: 16, gap: 14 }}>
        {/* ── Header row ── */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <CategoryBadge category={question.category} />

          {isClosed ? (
            <View
              style={{
                borderRadius: 7,
                backgroundColor: colors.noSoft,
                borderWidth: 1,
                borderColor: colors.noBorder,
                paddingHorizontal: 8,
                paddingVertical: 3,
              }}
            >
              <Text style={{ color: colors.no, fontFamily: typography.mono, fontSize: 11, letterSpacing: 0.4 }}>
                CLOSED
              </Text>
            </View>
          ) : question.is_trending ? (
            <View
              style={{
                borderRadius: 7,
                backgroundColor: "rgba(245, 158, 11, 0.15)",
                borderWidth: 1,
                borderColor: "#F59E0B",
                paddingHorizontal: 8,
                paddingVertical: 3,
              }}
            >
              <Text style={{ color: "#F59E0B", fontFamily: typography.mono, fontSize: 11, letterSpacing: 0.4 }}>
                🔥 Trending
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: colors.yes,
                  opacity: 0.85,
                }}
              />
              <Text style={{ color: colors.textMuted, fontFamily: typography.mono, fontSize: 12 }}>
                {timeLeft}
              </Text>
            </View>
          )}
        </View>

        {/* ── Question text ── */}
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 22,
            lineHeight: 30,
            fontFamily: typography.display,
            letterSpacing: -0.3,
          }}
          numberOfLines={4}
        >
          {question.text}
        </Text>

        {/* ── Voting or Results ── */}
        {hasVoted ? (
          <View style={{ gap: 10 }}>
            <ResultBar
              yesPercent={question.yes_percent}
              noPercent={100 - question.yes_percent}
            />
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: colors.textMuted, fontFamily: typography.body, fontSize: 12 }}>
                You voted{" "}
                <Text
                  style={{
                    color: question.user_voted === "yes" ? colors.yes : colors.no,
                    fontFamily: typography.bodyBold,
                  }}
                >
                  {question.user_voted?.toUpperCase()}
                </Text>
              </Text>
              {question.is_own ? (
                <View
                  style={{
                    borderRadius: 7,
                    borderWidth: 1,
                    borderColor: colors.brandBorder,
                    backgroundColor: colors.brandSoft,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                  }}
                >
                  <Text style={{ color: colors.brand, fontFamily: typography.mono, fontSize: 11 }}>YOURS</Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : (
          <VoteButtons
            onVote={(vote) => onVote(question.id, vote)}
            disabled={isVoteSubmitting}
            pendingVote={pendingVote}
          />
        )}

        {/* ── Footer row ── */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ color: colors.textMuted, fontFamily: typography.mono, fontSize: 12 }}>
            {question.total_votes.toLocaleString()} votes
          </Text>

          {question.is_own && !hasVoted ? (
            <View
              style={{
                borderRadius: 7,
                borderWidth: 1,
                borderColor: colors.brandBorder,
                backgroundColor: colors.brandSoft,
                paddingHorizontal: 8,
                paddingVertical: 3,
              }}
            >
              <Text style={{ color: colors.brand, fontFamily: typography.mono, fontSize: 11 }}>YOURS</Text>
            </View>
          ) : !hasVoted ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              <Text style={{ color: colors.textMuted, fontFamily: typography.body, fontSize: 12 }}>
                See result
              </Text>
              <Ionicons name="chevron-forward" size={12} color={colors.textMuted} />
            </View>
          ) : null}
        </View>
      </View>
    </PressableScale>
  );
}

