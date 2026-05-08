import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { typeScale } from "../constants/typography";

type EmptyStateProps = {
  title: string;
  subtitle: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function EmptyState({ title, subtitle, icon = "sparkles-outline" }: EmptyStateProps) {
  return (
    <View style={{ marginTop: spacing.huge, alignItems: "center", gap: spacing.base, paddingHorizontal: 28 }}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 22,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.brandSoft,
          borderWidth: 1,
          borderColor: colors.brandBorder,
        }}
      >
        <Ionicons name={icon} size={30} color={colors.brand} />
      </View>

      <Text
        style={{
          ...typeScale.title,
          color: colors.textPrimary,
          textAlign: "center",
          letterSpacing: -0.2,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          ...typeScale.body,
          color: colors.textSecondary,
          textAlign: "center",
        }}
      >
        {subtitle}
      </Text>
    </View>
  );
}

