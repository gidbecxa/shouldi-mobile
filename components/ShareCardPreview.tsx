import { Text, View } from "react-native";

import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { typeScale, typography } from "../constants/typography";
import { ResultBar } from "./ResultBar";

type ShareCardPreviewProps = {
  question: string;
  yesPercent: number;
  questionId: string;
};

export function ShareCardPreview({ question, yesPercent, questionId }: ShareCardPreviewProps) {
  return (
    <View
      pointerEvents="none"
      style={{
        borderRadius: spacing.base,
        borderWidth: 1,
        borderColor: colors.brandBorder,
        backgroundColor: colors.cardElevated,
        padding: spacing.base,
        gap: spacing.sm,
      }}
    >
      <View style={{ flexDirection: "row", gap: spacing.base }}>
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Text style={{ ...typeScale.micro, color: colors.brand, fontFamily: typography.bodyBold }}>Should I?</Text>
          <Text numberOfLines={2} style={{ ...typeScale.caption, color: colors.textPrimary }}>
            {question}
          </Text>
        </View>

        <View style={{ width: 80, gap: spacing.xs, alignItems: "flex-end" }}>
          <ResultBar yesPercent={yesPercent} noPercent={100 - yesPercent} height={8} />
          <Text style={{ ...typeScale.caption, color: colors.yes, fontFamily: typography.mono }}>{yesPercent}% YES</Text>
        </View>
      </View>

      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: spacing.sm,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ ...typeScale.micro, color: colors.textMuted }}>shouldi.fun/q/{questionId}</Text>
        <Text style={{ ...typeScale.micro, color: colors.brand, fontFamily: typography.bodySemiBold }}>Vote now →</Text>
      </View>
    </View>
  );
}
