import { Pressable, Text, View } from "react-native";

import { colors } from "../constants/colors";
import { Question } from "../lib/api";
import { CategoryBadge } from "./CategoryBadge";
import { ResultBar } from "./ResultBar";
import { VoteButtons } from "./VoteButtons";

type QuestionCardProps = {
  question: Question;
  hasVoted: boolean;
  onVote: (questionId: string, vote: "yes" | "no") => void;
  onOpen: (questionId: string) => void;
};

export function QuestionCard({ question, hasVoted, onVote, onOpen }: QuestionCardProps) {
  return (
    <Pressable
      onPress={() => onOpen(question.id)}
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 14,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <CategoryBadge category={question.category} />
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{question.total_votes} votes</Text>
      </View>

      <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: "700" }}>{question.text}</Text>

      {hasVoted ? (
        <ResultBar yesPercent={question.yes_percent} noPercent={100 - question.yes_percent} />
      ) : (
        <VoteButtons onVote={(vote) => onVote(question.id, vote)} />
      )}
    </Pressable>
  );
}
