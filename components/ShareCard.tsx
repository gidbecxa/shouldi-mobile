import { Text, View } from "react-native";

import { colors } from "../constants/colors";
import { typography } from "../constants/typography";

type ShareCardProps = {
  question: string;
  yesPercent: number;
  noPercent: number;
  totalVotes: number;
  /** true = question still accepting votes; false = closed/final */
  isActive?: boolean;
  questionId?: string;
};

export function ShareCard({ question, yesPercent, noPercent, totalVotes, isActive = true, questionId }: ShareCardProps) {
  const ctaLabel = isActive ? "Vote now →" : "Final results";
  const eyebrow = isActive
    ? `${totalVotes.toLocaleString()} votes so far · weigh in`
    : `${totalVotes.toLocaleString()} votes · final verdict`;
  const url = "shouldi.fun";
  return (
    <View
      style={{
        borderRadius: 24,
        backgroundColor: "#0F0F12",
        borderWidth: 1,
        borderColor: colors.borderStrong,
        overflow: "hidden",
      }}
    >
      {/* Violet accent bar */}
      <View style={{ height: 3, backgroundColor: colors.brand }} />

      <View style={{ padding: 22, gap: 18 }}>
        {/* App brand */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 7,
              backgroundColor: colors.brandSoft,
              borderWidth: 1,
              borderColor: colors.brandBorder,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 11, color: colors.brand, fontFamily: typography.bodyBold }}>?</Text>
          </View>
          <Text
            style={{
              color: colors.brand,
              fontFamily: typography.bodyBold,
              letterSpacing: 0.8,
              fontSize: 11,
              textTransform: "uppercase",
            }}
          >
            Should I? · Help Me Decide
          </Text>
        </View>

        {/* Question text */}
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 23,
            lineHeight: 31,
            fontFamily: typography.display,
            letterSpacing: -0.3,
          }}
        >
          {question}
        </Text>

        {/* Result visualization */}
        <View style={{ gap: 10 }}>
          {/* Segmented bar */}
          <View
            style={{
              height: 52,
              borderRadius: 14,
              overflow: "hidden",
              flexDirection: "row",
              backgroundColor: colors.surface,
            }}
          >
            <View
              style={{
                width: `${yesPercent}%`,
                backgroundColor: colors.yes,
                justifyContent: "center",
                paddingLeft: yesPercent > 18 ? 12 : 0,
              }}
            >
              {yesPercent > 18 ? (
                <Text style={{ color: "#fff", fontFamily: typography.bodyBold, fontSize: 15 }}>
                  {yesPercent}%
                </Text>
              ) : null}
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: colors.no,
                justifyContent: "center",
                alignItems: "flex-end",
                paddingRight: noPercent > 18 ? 12 : 0,
              }}
            >
              {noPercent > 18 ? (
                <Text style={{ color: "#fff", fontFamily: typography.bodyBold, fontSize: 15 }}>
                  {noPercent}%
                </Text>
              ) : null}
            </View>
          </View>

          {/* Legend */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.yes }} />
              <Text style={{ color: colors.yes, fontFamily: typography.mono, fontSize: 13 }}>YES</Text>
            </View>
            <Text style={{ color: colors.textMuted, fontFamily: typography.mono, fontSize: 12 }}>
              {eyebrow}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <Text style={{ color: colors.no, fontFamily: typography.mono, fontSize: 13 }}>NO</Text>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.no }} />
            </View>
          </View>
        </View>

        {/* CTA footer */}
        <View
          style={{
            borderRadius: 11,
            backgroundColor: isActive ? colors.brandSoft : colors.surface,
            borderWidth: 1,
            borderColor: isActive ? colors.brandBorder : colors.border,
            paddingHorizontal: 14,
            paddingVertical: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ color: colors.textMuted, fontFamily: typography.body, fontSize: 13 }}>
            {url}
          </Text>
          <Text style={{ color: isActive ? colors.brand : colors.textSecondary, fontFamily: typography.bodyBold, fontSize: 13 }}>
            {ctaLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

