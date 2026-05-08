import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { PressableScale } from "./PressableScale";

type DetailHeaderProps = {
  onBack: () => void;
  onOpenMenu: () => void;
};

export function DetailHeader({ onBack, onOpenMenu }: DetailHeaderProps) {
  return (
    <View
      style={{
        minHeight: 44,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <PressableScale
        onPress={onBack}
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: "center",
          justifyContent: "center",
          marginLeft: -spacing.xs,
        }}
      >
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
      </PressableScale>

      <View style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }} />

      <PressableScale
        onPress={onOpenMenu}
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: "center",
          justifyContent: "center",
          marginRight: -spacing.xs,
        }}
      >
        <Ionicons name="ellipsis-vertical" size={22} color={colors.textPrimary} />
      </PressableScale>
    </View>
  );
}
