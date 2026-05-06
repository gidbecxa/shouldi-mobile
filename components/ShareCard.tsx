import { Text, View } from "react-native";

import { colors } from "../constants/colors";

type ShareCardProps = {
  question: string;
  yesPercent: number;
  noPercent: number;
  totalVotes: number;
};

export function ShareCard({ question, yesPercent, noPercent, totalVotes }: ShareCardProps) {
  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 20, gap: 12 }}>
      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Should I?</Text>
      <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: "700" }}>{question}</Text>
      <Text style={{ color: colors.yes }}>YES {yesPercent}%</Text>
      <Text style={{ color: colors.no }}>NO {noPercent}%</Text>
      <Text style={{ color: colors.textSecondary }}>{totalVotes} people voted</Text>
    </View>
  );
}
