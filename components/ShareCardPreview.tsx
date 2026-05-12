import Ionicons from "@expo/vector-icons/Ionicons";
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

export function ShareCardPreview({ question, yesPercent }: ShareCardPreviewProps) {
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
      <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
        <View style={{ flex: 1, flexShrink: 1 }}>
          <Text style={{ ...typeScale.micro, color: colors.brand, fontFamily: typography.bodyBold }}>Should I?</Text>
          <Text
            style={{ ...typeScale.body, color: colors.textPrimary, marginTop: 4 }}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {question}
          </Text>
        </View>

        <View style={{ width: 72, flexShrink: 0, alignItems: "flex-end", gap: 4 }}>
          <ResultBar yesPercent={yesPercent} noPercent={100 - yesPercent} height={8} />
          <Text style={{ ...typeScale.caption, color: colors.yes, fontFamily: typography.mono }}>{yesPercent}% YES</Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 10,
          marginTop: 10,
        }}
      >
        <Text style={{ fontFamily: "DMMono_500Medium", fontSize: 11, color: colors.textMuted }}>
          shouldi.fun
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 3, flexShrink: 0 }}>
          <Text style={{ fontFamily: "DMSans_600SemiBold", fontSize: 11, color: colors.brand }}>
            Vote now
          </Text>
          <Ionicons name="chevron-forward" size={11} color={colors.brand} />
        </View>
      </View>
    </View>
  );
}
