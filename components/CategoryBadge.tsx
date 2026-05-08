import { Text, View } from "react-native";

import { categoryPalette } from "../constants/categoryPalette";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { typeScale } from "../constants/typography";

type CategoryBadgeProps = {
  category: string;
};

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const palette = categoryPalette[category as keyof typeof categoryPalette];

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: palette?.tint ?? colors.border,
        backgroundColor: palette?.soft ?? colors.surface,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: spacing.xs,
      }}
    >
      <Text
        style={{
          color: palette?.text ?? colors.textSecondary,
          ...typeScale.micro,
          letterSpacing: 0.8,
          textTransform: "uppercase",
        }}
      >
        {category}
      </Text>
    </View>
  );
}

