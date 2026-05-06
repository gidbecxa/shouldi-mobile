import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

import { ShareCard } from "../../components/ShareCard";
import { colors } from "../../constants/colors";

export default function QuestionDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16, gap: 14 }}>
      <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: "700" }}>Question Detail</Text>
      <Text style={{ color: colors.textSecondary }}>Question ID: {params.id}</Text>

      <ShareCard
        question="Should I quit my job and move abroad?"
        yesPercent={73}
        noPercent={27}
        totalVotes={328}
      />
    </View>
  );
}
