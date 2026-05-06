import { Text, View } from "react-native";

import { colors } from "../constants/colors";

type EmptyStateProps = {
  title: string;
  subtitle: string;
};

export function EmptyState({ title, subtitle }: EmptyStateProps) {
  return (
    <View style={{ padding: 20, alignItems: "center", gap: 8 }}>
      <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "700" }}>{title}</Text>
      <Text style={{ color: colors.textSecondary, textAlign: "center" }}>{subtitle}</Text>
    </View>
  );
}
